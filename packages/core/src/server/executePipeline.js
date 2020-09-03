import _ from 'lodash';
import { PassThrough } from 'stream';
import once from 'once';
import settings from '../settings';

const dispositionFrom = ({ extension }) => (extension ? `dump.${extension}` : 'inline');
const encodingFrom = (headers) => (headers && headers['content-encoding'] ? headers['content-encoding'] : 'identity');
const typeFrom = ({ mimeType }) => (mimeType || 'application/octet-stream');
const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);

function executePipeline(ezs, files, headers, query, triggerError, read, response) {
    const meta = ezs.memoize(`executePipeline>${files}`,
        () => files.map((file) => ezs.metaFile(file)).reduce((prev, cur) => _.merge(cur, prev), {}));
    const contentEncoding = encodingFrom(headers);
    const contentDisposition = dispositionFrom(meta);
    const contentType = typeFrom(meta);
    const { prepend, append } = meta;
    const prepend2Pipeline = ezs.parseCommand(onlyOne(prepend));
    const append2Pipeline = ezs.parseCommand(onlyOne(append));
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Content-Encoding', contentEncoding);
    response.setHeader('Content-Disposition', contentDisposition);
    response.setHeader('Content-Type', contentType);

    const input = new PassThrough();
    const createInput = (firstChunk) => {
        let midput;
        if (!firstChunk) {
            midput = input;
            input.write('No Content');
        } else {
            midput = input
                .pipe(ezs('truncate', { length: headers['content-length'] }))
                .pipe(ezs.uncompress(headers))
                .on('error', triggerError);
            input.write(firstChunk);
        }
        return midput;
    };
    const loop = (midput) => read((err, data, next) => {
        if (err) {
            triggerError(err);
            return false;
        }
        next();
        if (data === null) {
            midput.end();
            return null;
        }
        if (data) {
            midput.write(data);
            loop(midput);
            return true;
        }
        return false;
    });

    return read((firstError, firstChunk, firstCalled) => {
        if (firstError) {
            triggerError(firstError);
            return false;
        }
        const responseToBeContinued = setInterval(() => response.writeContinue(), settings.response.checkInterval);
        const responseStarted = once(() => clearInterval(responseToBeContinued));
        const inputBis = createInput(firstChunk);
        const { server, delegate } = settings;
        const execMode = server ? 'dispatch' : delegate;
        const statements = files.map((file) => ezs(execMode, { file, server }, query));
        if (prepend2Pipeline) {
            statements.unshift(ezs.createCommand(prepend2Pipeline, query));
        }
        if (append2Pipeline) {
            statements.push(ezs.createCommand(append2Pipeline, query));
        }
        ezs.createPipeline(inputBis, statements)
            .pipe(ezs.catch((e) => e))
            .on('error', (e) => {
                responseStarted();
                return triggerError(e);
            })
            .pipe(ezs((data, feed) => {
                if (!response.headersSent) {
                    response.writeHead(200);
                }
                responseStarted();
                return feed.send(data);
            }))
            .pipe(ezs.toBuffer())
            .pipe(ezs.compress(headers))
            .pipe(response)
            .on('error', () => responseStarted());
        firstCalled();
        if (firstChunk) {
            return loop(input);
        }
        return input.end();
    });
}

export default executePipeline;

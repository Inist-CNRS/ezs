import _ from 'lodash';
import { PassThrough } from 'stream';
import { server } from '../settings';
import { parseCommand } from '../script';

const dispositionFrom = ({ extension }) => (extension ? `dump.${extension}` : extension);
const encodingFrom = (headers) => (headers && headers['content-encoding'] ? headers['content-encoding'] : false);
const typeFrom = ({ mimeType }) => mimeType;
const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);
const prependCommand = ({ prepend }) => parseCommand(onlyOne(prepend));
const appendCommand = ({ append }) => parseCommand(onlyOne(append));

function executePipeline(ezs, files, headers, query, triggerError, read, response) {
    const meta = files.map((file) => ezs.metaFile(file)).reduce((prev, cur) => _.merge(cur, prev), {});

    response.setHeader('Content-Encoding', encodingFrom(headers) || 'identity');
    response.setHeader('Content-Disposition', dispositionFrom(meta) || 'inline');
    response.setHeader('Content-Type', typeFrom(meta) || 'application/octet-stream');
    const prepend2Pipeline = prependCommand(meta);
    const append2Pipeline = appendCommand(meta);

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
        const inputBis = createInput(firstChunk);
        const statements = files.map((file) => ezs('delegate', { file, server }, query));
        if (prepend2Pipeline) {
            statements.unshift(ezs.createCommand(prepend2Pipeline, query));
        }
        if (append2Pipeline) {
            statements.push(ezs.createCommand(append2Pipeline, query));
        }
        ezs.createPipeline(inputBis, statements)
            .pipe(ezs.catch((e) => e))
            .on('error', triggerError)
            .pipe(ezs((data, feed) => {
                if (!response.headersSent) {
                    response.writeHead(200);
                }
                return feed.send(data);
            }))
            .pipe(ezs.toBuffer())
            .pipe(ezs.compress(headers))
            .pipe(response);
        firstCalled();
        if (firstChunk) {
            return loop(input);
        }
        return input.end();
    });
}

export default executePipeline;

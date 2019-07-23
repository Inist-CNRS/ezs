import _ from 'lodash';
import iterate from 'stream-iterate';
import { PassThrough } from 'stream';

import debug from 'debug';
import Parameter from '../parameter';
import { isFile } from '../file';

const dispositionFrom = ({ extension }) => (extension ? `dump.${extension}` : extension);
const encodingFrom = headers => (headers && headers['content-encoding'] ? headers['content-encoding'] : false);
const typeFrom = ({ mimeType }) => mimeType;

const knownPipeline = ezs => (request, response) => {
    const { headers } = request;
    const { pathname, query } = request.url;
    const errorHandler = (error) => {
        debug('ezs')('Server has caught an error', error);
        if (!response.headersSent) {
            response.setHeader('Content-Type', 'text/plain');
            response.writeHead(400, { 'X-Error': Parameter.encode(error.toString()) });
            response.write(error.toString().split('\n', 1)[0]);
            response.end();
        }
    };
    const files = pathname
        .slice(1)
        .split(';')
        .map(file => ezs.fileToServe(file))
        .filter(file => isFile(file));

    const meta = files.map(file => ezs.metaFile(file)).reduce((prev, cur) => _.merge(cur, prev), {});

    if (files.length === 0) {
        response.writeHead(404);
        response.end();
        return false;
    }
    response.setHeader('Content-Encoding', encodingFrom(headers) || 'identity');
    response.setHeader('Content-Disposition', dispositionFrom(meta) || 'inline');
    response.setHeader('Content-Type', typeFrom(meta) || 'application/octet-stream');
    debug('ezs')(`PID ${process.pid} will execute ${pathname} commands with ${Object.keys(query).length || 0} global parameters`);

    const read = iterate(request);
    const input = new PassThrough();
    const createInput = (firstChunk) => {
        let midput;
        if (!firstChunk) {
            midput = input;
            input.write(pathname);
        } else {
            midput = input
                .pipe(ezs('truncate', { length: headers['content-length'] }))
                .pipe(ezs.uncompress(headers))
                .on('error', errorHandler);
            input.write(firstChunk);
        }
        return midput;
    };
    const loop = midput => read((err, data, next) => {
        if (err) {
            errorHandler(err);
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
            errorHandler(firstError);
            return false;
        }
        const inputBis = createInput(firstChunk);
        ezs.createPipeline(inputBis, files.map(file => ezs('delegate', { file }, query)))
            .pipe(ezs.catch(e => e))
            .on('error', errorHandler)
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
};

export default knownPipeline;

import _ from 'lodash';
import iterate from 'stream-iterate';
import { PassThrough } from 'stream';

import debug from 'debug';
import errorHandler from './errorHandler';
import { isFile } from '../file';

const dispositionFrom = ({ extension }) => (extension ? `dump.${extension}` : extension);
const encodingFrom = headers => (headers && headers['content-encoding'] ? headers['content-encoding'] : false);
const typeFrom = ({ mimeType }) => mimeType;

const knownPipeline = ezs => (request, response) => {
    const { headers } = request;
    const triggerError = errorHandler(request, response);
    const { pathname, query } = request.url;
    const files = pathname
        .slice(1)
        .split(',')
        .map(file => ezs.fileToServe(file))
        .filter(file => isFile(file));

    const meta = files.map(file => ezs.metaFile(file)).reduce((prev, cur) => _.merge(cur, prev), {});

    if (files.length === 0) {
        triggerError(new Error(`Cannot find ${pathname}`), 404);
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
                .on('error', triggerError);
            input.write(firstChunk);
        }
        return midput;
    };
    const loop = midput => read((err, data, next) => {
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
        ezs.createPipeline(inputBis, files.map(file => ezs('delegate', { file }, query)))
            .pipe(ezs.catch(e => e))
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
};

export default knownPipeline;

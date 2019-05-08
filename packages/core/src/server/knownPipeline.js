import _ from 'lodash';
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
            response.writeHead(500, { 'X-Error': Parameter.encode(error.toString()) });
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
    const input = request
        .pipe(ezs('truncate', { length: headers['content-length'] }))
        .pipe(ezs.uncompress(headers))
        .on('error', errorHandler);
    ezs.createPipeline(input, files.map(file => ezs('delegate', { file }, query)))
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
    request.resume();
    return true;
};

export default knownPipeline;

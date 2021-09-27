import iterate from 'stream-iterate';
import { join } from 'path';
import debug from 'debug';
import sizeof from 'object-sizeof';
import errorHandler from './errorHandler';
import executePipeline from './executePipeline';
import { isFile } from '../file';

const identifierPipeline = (ezs, serverPath) => (request, response) => {
    const { headers } = request;
    const triggerError = errorHandler(request, response);
    const { query } = request.url;
    const identifier = request.url.pathname.slice(1);
    const scheme = identifier.substr(0, identifier.indexOf(':'));
    const pathname = `${scheme}.ini`;
    const files = ezs.memoize(`identifierPipeline>${pathname}`, () => [pathname]
        .map((file) => join(serverPath, file))
        .filter((file) => isFile(file)));
    if (files.length === 0) {
        triggerError(new Error(`Cannot find ${pathname}`), 404);
        return false;
    }
    debug('ezs')(`PID ${process.pid} will execute ${pathname} commands with ${sizeof(query)}B of global parameters`);
    const input = ezs.createStream();
    const read = iterate(input);
    input.write(identifier);
    input.end();
    return executePipeline(ezs, files, headers, query, triggerError, read, response, pathname);
};

export default identifierPipeline;

import iterate from 'stream-iterate';
import { join, basename, dirname } from 'path';
import debug from 'debug';
import sizeof from 'object-sizeof';
import errorHandler from './errorHandler';
import executePipeline from './executePipeline';
import { isFile } from '../file';

const knownPipeline = (ezs, serverPath) => (request, response) => {
    const { headers } = request;
    const triggerError = errorHandler(request, response);
    const { pathname, query } = request.url;
    const files = ezs.memoize(`knownPipeline>${pathname}`,
        () => pathname
            .slice(1)
            .split(',')
            .map((file) => join(serverPath, dirname(file), basename(file, '.ini').concat('.ini')))
            .filter((file) => isFile(file)));
    if (files.length === 0) {
        triggerError(new Error(`Cannot find ${pathname}`), 404);
        return false;
    }

    debug('ezs')(`PID ${process.pid} will execute ${pathname} commands with ${sizeof(query)}B of global parameters`);
    const read = iterate(request);
    return executePipeline(ezs, files, headers, query, triggerError, read, response, pathname);
};

export default knownPipeline;

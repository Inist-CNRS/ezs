import { join, basename, dirname } from 'path';
import debug from 'debug';
import sizeof from 'object-sizeof';
import _ from 'lodash';
import errorHandler from './errorHandler';
import executePipeline from './executePipeline';
import { isFile } from '../file';
import settings from '../settings';


const dispositionFrom = ({ extension }) => (extension ? `dump.${extension}` : 'inline');

const encodingFrom = (headers) => (headers
    && headers['accept-encoding']
    && headers['accept-encoding'].match(/\bgzip\b/) ? 'gzip' : 'identity'
);

const typeFrom = ({ mimeType }) => (mimeType || 'application/json');

const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);

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


    const meta = ezs.memoize(`executePipeline>${files}`,
        () => files.map((file) => ezs.metaFile(file)).reduce((prev, cur) => _.merge(cur, prev), {}));
    const contentEncoding = encodingFrom(headers);
    const contentDisposition = dispositionFrom(meta);
    const contentType = typeFrom(meta);
    const { prepend, append } = meta;
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', '*');
    response.setHeader('Content-Encoding', contentEncoding);
    response.setHeader('Content-Disposition', contentDisposition);
    response.setHeader('Content-Type', contentType);

    if (request.method !== 'POST') {
        response.writeHead(200);
        response.end();
        return true;
    }

    const {
        server,
        delegate,
        tracerEnable,
        metricsEnable,
    } = settings;
    const execMode = server ? 'dispatch' : delegate;
    const statements = files.map((file) => ezs(execMode, { file, server }, query));
    const prepend2Pipeline = ezs.parseCommand(onlyOne(prepend));
    if (prepend2Pipeline) {
        statements.unshift(ezs.createCommand(prepend2Pipeline, query));
    }
    const append2Pipeline = ezs.parseCommand(onlyOne(append));
    if (append2Pipeline) {
        statements.push(ezs.createCommand(append2Pipeline, query));
    }
    if (tracerEnable) {
        statements.unshift(ezs('tracer', { print: '-', last: '>' }));
        statements.push(ezs('tracer', { print: '.', last: '!' }));
    }
    if (metricsEnable) {
        statements.unshift(ezs('metrics', { stage: pathname, bucket: 'input' }));
        statements.push(ezs('metrics', { stage: pathname, bucket: 'output' }));
    }

    return executePipeline(ezs, statements, triggerError, request, response);
};

export default knownPipeline;

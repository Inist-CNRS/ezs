import { join, basename, dirname } from 'path';
import debug from 'debug';
import sizeof from 'object-sizeof';
import { PassThrough } from 'stream';
import once from 'once';
import _ from 'lodash';
import { metricsHandle } from './metrics';
import errorHandler from './errorHandler';
import { isFile } from '../file';
import settings from '../settings';


const dispositionFrom = ({ extension }) => (extension ? `dump.${extension}` : 'inline');

const encodingFrom = (headers) => (headers
    && headers['accept-encoding']
    && headers['accept-encoding'].match(/\bgzip\b/) ? 'gzip' : 'identity'
);

const typeFrom = ({ mimeType }) => (mimeType || 'application/json');

const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);

const knownPipeline = (ezs) => (request, response, next) => {

    if (request.catched || !request.methodMatch(['POST', 'OPTIONS', 'HEAD']) || request.serverPath === false || !request.isPipeline()) {
        return next();
    }
    request.catched = true;
    debug('ezs')(`Create middleware 'knownPipeline' for ${request.method} ${request.pathName}`);

    const { headers } = request;
    const triggerError = errorHandler(request, response);
    const { query } = request.urlParsed;
    const files = ezs.memoize(`knownPipeline>${request.pathName}`,
        () => request.pathName
            .slice(1)
            .split(',')
            .map((file) => join(request.serverPath, dirname(file), basename(file, '.ini').concat('.ini')))
            .filter((file) => isFile(file)));
    if (files.length === 0) {
        triggerError(new Error(`Cannot find ${request.pathName}`), 404);
        return false;
    }

    debug('ezs')(
        `PID ${process.pid} will execute ${request.pathName} commands with ${sizeof(query)}B of global parameters`,
    );

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
    response.socket.setNoDelay(false);

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
        statements.unshift(ezs(metricsHandle, { pathName: request.pathName, bucket: 'input' }));
        statements.push(ezs(metricsHandle, { pathName: request.pathName, bucket: 'output' }));
    }

    const rawStream = new PassThrough();
    let emptyStream = true;
    const responseToBeContinued = setInterval(() => response.writeContinue(), settings.response.checkInterval);
    const responseStarted = once(() => clearInterval(responseToBeContinued));

    const decodedStream = rawStream
        .pipe(ezs('truncate', { length: request.headers['content-length'] }))
        .pipe(ezs.uncompress(request.headers));

    const transformedStream = ezs.createPipeline(decodedStream, statements)
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
            emptyStream = false;
            return feed.send(data);
        }))
        .pipe(ezs.toBuffer())
        .pipe(ezs.compress(response.getHeaders()))
        .on('error', () => responseStarted())
        .on('end', () => {
            response.end();
        });

    transformedStream.pipe(response, { end: false });

    request
        .on('aborted', () => {
            rawStream.destroy();
        })
        .on('error', (e) => {
            request.unpipe(rawStream);
            triggerError(e);
        })
        .on('close', () => {
            if (emptyStream) {
                transformedStream.destroy(new Error('No Content'));
            }
        })
        .on('end', () => {
            rawStream.end();
        });
    request.pipe(rawStream);
    request.resume();
    response.on('close', next);
};

export default knownPipeline;

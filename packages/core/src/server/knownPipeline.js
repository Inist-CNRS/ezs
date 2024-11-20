import { join, basename, dirname } from 'path';
import debug from 'debug';
import sizeof from 'object-sizeof';
import { PassThrough } from 'readable-stream';
import { pipeline } from 'stream';
import once from 'once';
import _ from 'lodash';
import { metricsHandle } from './metrics';
import errorHandler from './errorHandler';
import { isFile } from '../file';
import breaker from '../statements/breaker';
import settings from '../settings';

const dispositionFrom = ({ extension }) => (extension ? `attachment; filename="dump.${extension}"` : 'inline');

const encodingFrom = (headers) => (headers
    && headers['accept-encoding']
    && headers['accept-encoding'].match(/\bgzip\b/) ? 'gzip' : 'identity'
);

const typeFrom = ({ mimeType }) => (mimeType || 'application/json');

const onlyOne = (item) => (Array.isArray(item) ? item.shift() : item);

const knownPipeline = (ezs) => (request, response, next) => {
    if (request.catched
      || !request.methodMatch(['POST', 'OPTIONS', 'HEAD'])
      || request.serverPath === false
      || !request.isPipeline()
    ) {
        return next();
    }
    request.catched = true;
    const { headers, fusible, method, pathName } = request;
    const { query } = request.urlParsed;

    debug('ezs:info')(`Create middleware 'knownPipeline' for ${method} ${pathName}`);
    const triggerError = errorHandler(request, response);
    const files = ezs.memoize(`knownPipeline>${pathName}`,
        () => pathName
            .slice(1)
            .split(',')
            .map((file) => join(request.serverPath, dirname(file), basename(file, '.ini').concat('.ini')))
            .filter((file) => isFile(file)));
    if (files.length === 0) {
        triggerError(new Error(`Cannot find ${pathName}`), 404);
        return false;
    }
    debug('ezs:debug')(
        `PID ${process.pid} will execute ${pathName} commands with ${sizeof(query)}B of global parameters`,
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
    response.setHeader('Access-Control-Expose-Headers', '*');
    response.setHeader('Content-Encoding', contentEncoding);
    response.setHeader('Content-Disposition', contentDisposition);
    response.setHeader('Content-Type', contentType);
    response.setHeader('X-Request-ID', fusible);

    response.socket.setNoDelay(false);

    if (method !== 'POST') {
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
    const environment = { ...query, headers, request: { fusible, method, pathName } };
    const statements = files.map((file) => ezs(execMode, { file, server }, environment));
    const prepend2Pipeline = ezs.parseCommand(onlyOne(prepend));
    if (prepend2Pipeline) {
        statements.unshift(ezs.createCommand(prepend2Pipeline, environment));
    }
    const append2Pipeline = ezs.parseCommand(onlyOne(append));
    if (append2Pipeline) {
        statements.push(ezs.createCommand(append2Pipeline, environment));
    }
    if (tracerEnable) {
        statements.unshift(ezs('tracer', { print: '-', last: '>' }));
        statements.push(ezs('tracer', { print: '.', last: '!' }));
    }
    if (metricsEnable) {
        ezs.use({metrics: metricsHandle(pathName)});
        statements.unshift(ezs('metrics', { bucket: 'input' }));
        statements.push(ezs('metrics', { bucket: 'output' }));
    }
    statements.unshift(ezs(breaker, { fusible }));
    statements.push(ezs(breaker, { fusible }));

    const rawStream = new PassThrough();
    let emptyStream = true;
    const responseToBeContinued = setInterval(() => response.writeContinue(), settings.response.checkInterval);
    const responseStarted = once(() => clearInterval(responseToBeContinued));

    statements.push(ezs((data, feed) => {
        if (!response.headersSent) {
            response.writeHead(200);
        }
        responseStarted();
        emptyStream = false;
        return feed.send(data);
    }));

    const decodedStream = rawStream
        .pipe(ezs('truncate', { length: request.headers['content-length'] }))
        .pipe(ezs.uncompress(request.headers));

    const outputStream = new PassThrough();
    outputStream.pipe(response);
    const transformedStream = ezs.createPipeline(decodedStream, statements)
        .on('unpipe', () => {
            request.unpipe(rawStream);
            rawStream.end();
        })
        .pipe(ezs.catch((e) => e))
        .on('error', (e) => {
            outputStream.unpipe(response);
            responseStarted();
            triggerError(e, 400);
            rawStream.destroy();
            decodedStream.destroy();
            transformedStream.destroy();
        });

    pipeline(
        transformedStream,
        ezs.toBuffer(),
        ezs.compress(response.getHeaders()),
        outputStream,
        (e) => {
            if (e) {
                outputStream.unpipe(response);
                responseStarted();
                triggerError(e, 500);
            }
        }
    );

    request
        .once('aborted', () => {
            request.unpipe(rawStream);
            rawStream.end();
        })
        .on('error', (e) => {
            request.unpipe(rawStream);
            rawStream.end();
            triggerError(e, 500);
        })
        .once('close', () => {
            if (emptyStream) {
                //transformedStream.destroy(new Error('No Content'));
            }
        })
        .once('end', () => {
            rawStream.end();
        });
    request.pipe(rawStream);
    request.resume();
};

export default knownPipeline;

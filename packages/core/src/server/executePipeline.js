import { PassThrough } from 'stream';
import once from 'once';
import settings from '../settings';


export default function executePipeline(ezs, statements, triggerError, request, response) {

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
}

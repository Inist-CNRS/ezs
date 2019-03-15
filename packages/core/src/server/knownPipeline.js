import { DEBUG } from '../constants';
import Parameter from '../parameter';
import { isFile } from '../file';

const knownPipeline = ezs => (request, response) => {
    const { pathname, query } = request.url;
    const filePath = ezs.fileToServe(pathname);
    if (!isFile(filePath)) {
        response.writeHead(404);
        response.end();
        return false;
    }
    const { headers } = request;
    response.setHeader('Content-Encoding', headers['content-encoding'] || 'identity');
    DEBUG(`PID ${process.pid} will execute ${filePath} commands with ${Object.keys(query).length || 0} global parameters`);
    const processor = ezs.fromFile(filePath, query);
    request
        .pipe(ezs.uncompress(headers))
        .pipe(processor)
        .pipe(ezs.catch((error) => {
            DEBUG('Server has caught an error', error);
            if (!response.headersSent) {
                response.writeHead(500, { 'X-Error': Parameter.encode(error.toString()) });
                response.end();
            }
        }))
        .pipe(ezs((input, output) => {
            if (!response.headersSent) {
                response.writeHead(200);
            }
            return output.send(input);
        }))
        .pipe(ezs.toBuffer())
        .pipe(ezs.compress(headers))
        .pipe(response);
    request.resume();
    return true;
};

export default knownPipeline;

import { DEBUG } from '../constants';
import Parameter from '../parameter';
import { isFile } from '../file';

const knownPipeline = ezs => (request, response) => {
    const { url } = request;
    const filePath = ezs.fileToServe(url);
    if (!isFile(filePath)) {
        response.writeHead(404);
        response.end();
        return false;
    }
    const { headers } = request;
    response.setHeader('Content-Encoding', headers['content-encoding']);
    const environment = Object.keys(headers)
        .filter(headerKey => (headerKey.indexOf('x-environment') === 0))
        .map(headerKey => headerKey.replace('x-environment-', ''))
        .map(environmentKey => ({
            [environmentKey]: Parameter.unpack(headers[`x-environment-${environmentKey}`]),
        }))
        .reduce((prev, cur) => Object.assign(prev, cur), {});
    DEBUG(`PID ${process.pid} will execute ${filePath} commands with ${environment.length || 0} global parameters`);
    const processor = ezs.fromFile(filePath, environment);
    request
        .pipe(ezs.uncompress(headers))
        .pipe(ezs('unpack'))
        .pipe(ezs('ungroup'))
        .pipe(processor)
        .pipe(ezs.catch((error) => {
            DEBUG('Server has caught an error', error);
            if (!response.headersSent) {
                response.writeHead(400, { 'X-Error': Parameter.encode(error.toString()) });
                response.end();
            }
        }))
        .pipe(ezs((input, output, idx) => {
            if (idx === 1) {
                response.writeHead(200);
            }
            return output.send(input);
        }))
        .pipe(ezs('group'))
        .pipe(ezs('pack'))
        .pipe(ezs.compress(headers))
        .pipe(response);
    request.resume();
    return true;
};

export default knownPipeline;

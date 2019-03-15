import { DEBUG } from '../constants';
import Parameter from '../parameter';

const unknownPipeline = ezs => (request, response) => {
    const { headers } = request;
    response.setHeader('Content-Encoding', headers['content-encoding'] || 'identity');
    const commands = Object.keys(headers)
        .filter(headerKey => (headerKey.indexOf('x-command') === 0))
        .map(headerKey => parseInt(headerKey.replace('x-command-', ''), 10))
        .sort((x, y) => x - y)
        .map(commandIndex => Parameter.unscramble(headers[`x-command-${commandIndex}`]));
    const environment = Object.keys(headers)
        .filter(headerKey => (headerKey.indexOf('x-environment') === 0))
        .map(headerKey => headerKey.replace('x-environment-', ''))
        .map(environmentKey => ({
            [environmentKey]: Parameter.unpack(headers[`x-environment-${environmentKey}`]),
        }))
        .reduce((prev, cur) => Object.assign(prev, cur), {});
    DEBUG(`PID ${process.pid} will execute ${commands.length || 0} commands with ${Object.keys(environment).length || 0} global parameters`);
    const processor = ezs.pipeline(commands, environment);
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
        .pipe(ezs((input, output) => {
            if (!response.headersSent) {
                response.writeHead(200);
            }
            return output.send(input);
        }))
        .pipe(ezs('group'))
        .pipe(ezs('pack'))
        .pipe(ezs.compress(headers))
        .pipe(response);
    request.resume();
};

export default unknownPipeline;

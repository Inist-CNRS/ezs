import debug from 'debug';
import Parameter from '../parameter';
import errorHandler from './errorHandler';

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
        .map((environmentKey) => {
            const { k, v } = Parameter.unpack(headers[`x-environment-${environmentKey}`]);
            return {
                [k]: v,
            };
        })
        .reduce((prev, cur) => Object.assign(prev, cur), {});
    debug('ezs')(`PID ${process.pid} will execute ${commands.length || 0} commands with ${Object.keys(environment).length || 0} global parameters`);
    request
        .pipe(ezs.uncompress(headers))
        .pipe(ezs('unpack'))
        .pipe(ezs('ungroup'))
        .pipe(ezs('delegate', { commands }, environment))
        .pipe(ezs.catch(errorHandler(request, response)))
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

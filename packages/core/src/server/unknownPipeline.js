import debug from 'debug';
import sizeof from 'object-sizeof';
import Parameter from '../parameter';
import errorHandler from './errorHandler';

const unknownPipeline = ezs => (request, response, next) => {

    if (request.catched || !request.methodMatch(['POST']) || request.pathName !== '/') {
        return next();
    }
    request.catched = true;
    debug('ezs')(`Create middleware 'unknownPipeline' for ${request.method} ${request.pathName}`);

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
    debug('ezs')(
        `PID ${process.pid} will execute ${commands.length} commands with ${sizeof(environment)} of global parameters`,
    );
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
    response.on('close', next);
};

export default unknownPipeline;

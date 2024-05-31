import debug from 'debug';
import { disableFusible } from '../fusible';

const serverInformation =  () => (request, response, next) => {
    if (!request.methodMatch(['DELETE']) || request.pathName !== '/') {
        return next();
    }
    request.catched = true;
    debug('ezs')(`Create middleware 'serverControl' for ${request.method} ${request.pathName}`);
    const input = [];
    return request
        .on('error', err => next(err))
        .on('data', chunk => {
            input.push(chunk);
        })
        .on('end', async () => {
            try {
                const body = Buffer.concat(input).toString();
                const bodyParsed = JSON.parse(body);
                await disableFusible(bodyParsed['x-request-id'] || bodyParsed['X-Request-ID']);
                response.writeHead(202);
                response.end();
                next();
            }
            catch (e) {
                next(e);
            }
        });
};

export default serverInformation;

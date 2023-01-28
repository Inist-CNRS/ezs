import debug from 'debug';
import settings from '../settings';
import {
    getState,
} from './metrics';


const serverHealth =  () => (request, response, next) => {
    if (!settings.metricsEnable) {
        return next();
    }
    if (!request.methodMatch(['GET', 'OPTIONS', 'HEAD']) || !request.routeMatch(['/live', '/ready'])) {
        return next();
    }
    request.catched = true;
    debug('ezs')(`Create middleware 'serverHealth' for ${request.method} ${request.pathName}`);

    return getState()
        .then(
            (metrics) => {
                const states = metrics
                    .split('\n')
                    .filter(line => (line.search(/ezs_server_state/) === 0))
                    .map(line => parseInt(line.split(' ').pop(), 10));
                const statusCode = states.every(x => (x === 1)) ? 200 : 500;
                const responseObject = {
                    statusCode,
                    states,
                };
                const responseBody = JSON.stringify(responseObject);
                const responseHeaders = {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': '*',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(responseBody),
                };
                response.writeHead(statusCode, responseHeaders);
                response.write(responseBody);
                response.end();
                return next();
            }).catch(next);

};

export default serverHealth;

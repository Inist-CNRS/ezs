import debug from 'debug';
import Parameter from '../parameter';
import settings from '../settings';
import { getMetricLogger }  from '../logger'

let errorCounter = 0;
const errorHandler = (request, response) => (error, code = 400) => {
    debug('ezs')('Server has caught an error', error);
    if (!response.headersSent) {
        response.setHeader('Content-Type', 'text/plain');
        response.setHeader('Content-Disposition', 'inline');
        response.writeHead(code, { 'X-Error': Parameter.encode(error.toString()) });
        response.write(error.toString().split('\n', 1)[0]);
    }
    response.end();
    errorCounter += 1;
    const logger = getMetricLogger('error', request.url.pathname);
    logger('ezs_statement_error_counter', errorCounter);
};

export default errorHandler;

import debug from 'debug';
import Parameter from '../parameter';
import { httpRequestErrorTotal }  from './metrics';

const errorHandler = (request, response) => (error, code = 400) => {
    debug('ezs')('Server has caught an error', error);
    httpRequestErrorTotal.labels(request.pathName).inc();
    if (!response.headersSent) {
        response.setHeader('Content-Type', 'text/plain');
        response.setHeader('Content-Disposition', 'inline');
        response.writeHead(code, { 'X-Error': Parameter.encode(error.toString()) });
        response.write(error.toString().split('\n', 1)[0]);
    }
    response.end();
};

export default errorHandler;

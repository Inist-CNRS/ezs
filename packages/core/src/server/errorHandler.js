import debug from 'debug';
import Parameter from '../parameter';
import { httpRequestErrorTotal }  from './metrics';

const errorHandler = (request, response) => (error, code = 400) => {
    debug('ezs')('Server has caught an error', error);
    httpRequestErrorTotal.labels(request.pathName).inc();
    if (response.headersSent) {
        return response.end();
    }
    const bodyResponse = JSON.stringify(error);
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Content-Length', bodyResponse.length);
    response.setHeader('Content-Disposition', 'inline');
    response.writeHead(code, { 'X-Error': Parameter.encode(error.toString()) });
    return response.end(bodyResponse);
};

export default errorHandler;

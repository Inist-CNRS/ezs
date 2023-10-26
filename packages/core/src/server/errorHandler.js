import debug from 'debug';
import { httpRequestErrorTotal }  from './metrics';

const errorHandler = (request, response) => (error, code = 400) => {
    debug('ezs')('Server has caught an error', error);
    httpRequestErrorTotal.labels(request.pathName).inc();
    if (response.headersSent) {
        return response.end();
    }
    const bodyResponse = JSON.stringify(error);
    response.writeHead(code, {
        'Content-Type': 'application/json',
        'Content-Length': bodyResponse.length,
    });
    return response.end(bodyResponse);
};

export default errorHandler;

import debug from 'debug';
import JSONB from 'json-buffer';
import { httpRequestErrorTotal }  from './metrics';

const errorHandler = (ezs, request, response) => (error, code = 400) => {
    debug('ezs:error')(`Server has caught an error #${code}`, ezs.serializeError(error));
    httpRequestErrorTotal.labels(request.pathName).inc();
    if (response.headersSent) {
        return response.end();
    }
    const bodyResponse = JSONB.stringify(error);
    response.writeHead(code, {
        'Content-Type': 'application/json',
        'Content-Length': bodyResponse.length,
        'Content-Encoding': 'identity',
    });
    return response.end(bodyResponse);
};

export default errorHandler;

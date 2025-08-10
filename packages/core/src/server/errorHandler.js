import debug from 'debug';
import JSONB from 'json-buffer';
import { httpRequestErrorTotal }  from './metrics.js';

const errorHandler = (ezs, request, response) => (error, code = 400) => {
    const stringError = ezs.serializeError(error);
    debug('ezs:error')(`Server has caught an error #${code}`, stringError);
    httpRequestErrorTotal.labels(request.pathName).inc();
    if (response.headersSent) {
        return response.end();
    }
    const bodyResponse = JSONB.stringify(JSON.parse(stringError));
    response.writeHead(code, {
        'Content-Type': 'application/json',
        'Content-Length': bodyResponse.length,
        'Content-Encoding': 'identity',
    });
    return response.end(bodyResponse);
};

export default errorHandler;

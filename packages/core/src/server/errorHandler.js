import debug from 'debug';
import JSONB from 'json-buffer';
import { httpRequestErrorTotal }  from './metrics.js';

// logs the error and counts it in the metrics, without touching the response
export const reportError = (ezs, request) => (error, code = 400) => {
    const stringError = ezs.serializeError(error);
    debug('ezs:error')(`Server has caught an error #${code}`, stringError);
    httpRequestErrorTotal.labels(request.pathName).inc();
    return stringError;
};

const errorHandler = (ezs, request, response) => (error, code = 400) => {
    const stringError = reportError(ezs, request)(error, code);
    if (response.headersSent) {
        // too late for an error status: a broken connection tells the client
        return response.destroy();
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

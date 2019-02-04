import {
    PORT, VERSION, NCPUS, STARTED_AT,
} from '../constants';

const infoSince = startedAt => ({
    concurrency: NCPUS,
    uptime: Date.now() - startedAt,
    timestamp: Date.now(),
    version: VERSION,
    port: PORT,
});

const serverInformation = () => (request, response) => {
    const responseBody = JSON.stringify(infoSince(STARTED_AT));
    const responseHeaders = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(responseBody),
    };
    response.writeHead(200, responseHeaders);
    response.write(responseBody);
    response.end();
};

export default serverInformation;

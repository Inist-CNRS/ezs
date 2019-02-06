import dir from 'node-dir';
import Parameter from '../parameter';
import {
    DEBUG, VERSION, NCPUS, STARTED_AT,
} from '../constants';

const getInformations = dirPath => new Promise((resolve, reject) => {
    dir.files(dirPath, (err, files) => {
        if (err) {
            return reject(err);
        }
        const scripts = files
            .filter(f => (f.search(/\.(ini|ezs)$/) > 0))
            .map(f => f.replace(dirPath, ''));
        return resolve({
            concurrency: NCPUS,
            uptime: Date.now() - STARTED_AT,
            timestamp: Date.now(),
            version: VERSION,
            scripts,
        });
    });
});

const serverInformation = ezs => (request, response) => {
    getInformations(ezs.fileToServe(''))
        .then((informations) => {
            const responseBody = JSON.stringify(informations);
            const responseHeaders = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseBody),
            };
            response.writeHead(200, responseHeaders);
            response.write(responseBody);
            response.end();
        })
        .catch((error) => {
            DEBUG('Server has caught an error', error);
            if (!response.headersSent) {
                response.writeHead(500, { 'X-Error': Parameter.encode(error.toString()) });
            }
            response.end();
        });
};

export default serverInformation;

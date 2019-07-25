import dir from 'node-dir';
import settings from '../settings';
import {
    VERSION, STARTED_AT,
} from '../constants';

const getInformations = dirPath => new Promise((resolve) => {
    const infos = {
        concurrency: settings.nShards,
        uptime: Date.now() - STARTED_AT,
        timestamp: Date.now(),
        version: VERSION,
        daemon: (dirPath !== false),
        slave: (dirPath === false),
    };
    if (!dirPath) {
        return resolve(infos);
    }
    return dir.files(dirPath, (err, files) => {
        const filenames = err ? [] : files;
        const scripts = filenames
            .filter(f => (f.search(/\.(ini|ezs)$/) > 0))
            .map(f => f.replace(dirPath, ''));
        return resolve({
            ...infos,
            scripts,
        });
    });
});

const serverInformation = (ezs, serverPath) => (request, response) => {
    getInformations(serverPath)
        .then((informations) => {
            const responseBody = JSON.stringify(informations);
            const responseHeaders = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(responseBody),
            };
            response.writeHead(200, responseHeaders);
            response.write(responseBody);
            response.end();
        });
};

export default serverInformation;

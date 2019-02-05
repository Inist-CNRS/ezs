import { createReadStream } from 'fs';
import { isFile } from '../file';

const serverPipeline = ezs => (request, response) => {
    const { pathname } = request.url;
    const filePath = ezs.fileToServe(pathname);
    if (!isFile(filePath)) {
        response.writeHead(404);
        response.end();
        return false;
    }
    response.writeHead(200, {
        'Content-Type': 'text/plain',
    });
    createReadStream(filePath).pipe(response);
    return true;
};

export default serverPipeline;

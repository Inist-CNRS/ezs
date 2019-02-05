import path from 'path';
import { createReadStream } from 'fs';
import { isFile } from '../file';

const serverPipeline = ezs => (request, response) => {
    const { url } = request;
    const filePath = ezs.fileToServe(url);
    const { fileName } = path.parse(filePath);
    if (!isFile(filePath)) {
        response.writeHead(404);
        response.end();
        return false;
    }
    response.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=${fileName}`,
    });
    createReadStream(filePath).pipe(response);
    return true;
};

export default serverPipeline;

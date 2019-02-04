import path from 'path';
import fs from 'fs';

const knownPipeline = ezs => (request, response) => {
    const { url } = request;
    const filePath = ezs.fileToServe(url);
    const { fileName } = path.parse(filePath);
    try {
        const fileExists = fs.statSync(filePath).isFile();
        if (fileExists) {
            response.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Disposition': `attachment; filename=${fileName}`,
            });
            fs.createReadStream(filePath).pipe(response);
        } else {
            response.writeHead(404);
            response.end();
        }
    } catch (e) {
        response.writeHead(404);
        response.end();
    }
};

export default knownPipeline;

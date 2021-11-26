import fs from 'fs/promises';

/**
 * Take an array of file paths as input, and returns a list of
 * objects containing the `path`, and the `content` of each file.
 *
 * @export
 * @name TeeftGetFilesContent
 * @return {[{path: string, content: string}]} Array of { path, content }
 */
export default function TeeftGetFilesContent(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const filePaths = Array.isArray(data) ? data : [data];
    const promises = filePaths.map((filePath) => {
        const promise = fs.readFile(filePath, 'utf8')
            .then(content => ({
                path: filePath,
                content,
            }));
        return promise;
    });
    Promise.all(promises)
        .then((objects) => {
            feed.write(objects);
        })
        .catch((err) => {
            feed.write([err]);
        })
        .finally(() => {
            feed.end();
        });
}

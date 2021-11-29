import readFilePromise from 'fs-readfile-promise';

/**
 * Take an array of file paths as input, and returns a list of
 * objects containing the `path`, and the `content` of each file.
 *
 * @export
 * @name TeeftGetFilesContent
 * @return {[{path: string, content: string}]} Array of { path, content }
 */
export default async function TeeftGetFilesContent(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const filePath = data;
    let content;
    try {
        content = await readFilePromise(filePath, 'utf8');
        feed.write([{ path: filePath , content }]);
    } catch (err) {
        feed.write([err]);
    }
    feed.end();
}

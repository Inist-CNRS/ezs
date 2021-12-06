import path from 'path';
import { glob } from 'glob';
import { startsWith, trim } from 'ramda';

/**
 * Take an array of directory paths as input, a pattern, and returns a list of
 * file paths matching the pattern in the directories from the input.
 *
 * @export
 * @param {String}  [pattern="*"]   pattern for files (ex: "*.txt")
 * @returns {[String]} an array of file paths
 * @name TeeftListFiles
 */
export default function TeeftListFiles(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const pattern = this.getParam('pattern', '*');
    let dirPath = startsWith('.', data)
        ? path.resolve(process.cwd(), data)
        : data;
    dirPath = trim(dirPath);
    glob(`${dirPath}/${pattern}`, (err, files) => {
        if (err) {
            throw err;
        }
        if (files.length) {
            files.forEach(file => feed.write(file));
        }
        feed.end();
    });
}

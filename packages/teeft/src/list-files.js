import path from 'path';
import { glob } from 'glob';
import { replace, startsWith } from 'ramda';

function TeeftListFiles(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const pattern = this.getParam('pattern', '*');
    let dirPath = startsWith('.', data)
        ? path.resolve(process.cwd(), data)
        : data;
    dirPath = replace(/\n$/, '', dirPath);
    glob(`${dirPath}/${pattern}`, (err, files) => {
        if (err) {
            throw err;
        }
        if (files.length) {
            feed.write(files);
        }
        feed.end();
    });
}

/**
 * Take an array of directory paths as input, a pattern, and returns a list of
 * file paths matching the pattern in the directories from the input.
 *
 * @name ListFiles
 * @param {String}  [pattern="*"]   pattern for files (ex: "*.txt")
 * @param {[String]} feed    an array of file paths
 */
export default {
    TeeftListFiles,
};

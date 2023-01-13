import tmpFilepath from 'tmp-filepath';
import fs from 'fs';
import writeTo from 'stream-write';

function normalize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const struct = this.getEnv();
    const vv = {};
    struct.forEach((k) => {
        if (!data[k]) {
            vv[k] = '';
        } else {
            vv[k] = data[k];
        }
    });
    return feed.send(vv);
}

function cleanup(data, feed) {
    if (this.isLast()) {
        const filename = this.getParam('filename');
        if (filename) {
            return fs.unlink(filename, () => feed.close());
        }
        return feed.close();
    }
    return feed.send(data);
}

function OBJStandardize(data, feed) {
    const self = this;
    const { ezs } = this;
    if (!self.tmpFile) {
        self.tmpFile = tmpFilepath('.bin');
        self.struct = [];
        self.tmpInput = ezs.createStream(ezs.objectMode());
        self.tmpStream = self.tmpInput
            .pipe(ezs('pack'))
            .pipe(ezs.toBuffer())
            .pipe(ezs.compress())
            .pipe(fs.createWriteStream(self.tmpFile));
        self.tmpHandle = new Promise((resolve, reject) =>
            self.tmpStream.on('error', reject).on('close', resolve),
        );
    }

    if (self.isLast()) {
        self.tmpInput.end();
        return self.tmpHandle
            .then(() => feed.flow(
                fs.createReadStream(self.tmpFile)
                    .pipe(ezs.uncompress())
                    .pipe(ezs('unpack'))
                    .pipe(ezs(normalize, {}, self.struct))
                    .pipe(ezs(cleanup, { filename: self.tmpFile }))))
            .catch(e => feed.stop(e));
    }
    Object.keys(data).forEach((k) => {
        if (self.struct.indexOf(k) === -1) {
            self.struct.push(k);
        }
    });
    writeTo(self.tmpInput, data, () => feed.end());
}

/**
 * Standardize `Object`s so that each object have the same keys.
 *
 * Input:
 *
 * ```json
 * [{ "a": 1, "b": 2},
 *  { "b": 2, "c": 3},
 *  { "a": 1, "c": 3}]
 * ```
 *
 * Output:
 *
 * ```json
 * [{ "a": 1, "b": 2, "c": ""},
 *  { "b": 2, "b": "", "c": 3},
 *  { "a": 1, "b": "", "c": 3}]
 * ```
 *
 * @name OBJStandardize
 * @alias standardize
 * @param {undefined} none
 * @returns {Object}
 */
export default {
    OBJStandardize,
};

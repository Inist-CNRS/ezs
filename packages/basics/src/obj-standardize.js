import ezs from 'ezs';
import tmpFilepath from 'tmp-filepath';
import fs from 'fs';
import { writeTo } from './utils';

function OBJStandardize(data, feed) {
    const self = this;
    if (!self.tmpFile) {
        self.tmpFile = tmpFilepath('.bin');
        self.struct = [];
        self.tmpInput = ezs.createStream(ezs.objectMode());
        self.tmpStream = self.tmpInput
            .pipe(ezs('pack'))
            .pipe(ezs.toBuffer())
            .pipe(ezs.compress())
            .pipe(fs.createWriteStream(self.tmpFile));
        self.tmpHandle = new Promise((resolve, reject) => self.tmpStream.on('error', reject).on('close', resolve));
    }

    if (self.isLast()) {
        self.tmpInput.end();
        self.tmpHandle.then(() => {
            fs.createReadStream(self.tmpFile)
                .pipe(ezs.uncompress())
                .pipe(ezs('unpack'))
                .on('error', (e) => {
                    throw e;
                })
                .on('data', (d) => {
                    const vv = {};
                    self.struct.forEach((k) => {
                        if (!d[k]) {
                            vv[k] = '';
                        } else {
                            vv[k] = d[k];
                        }
                    });
                    feed.write(vv);
                })
                .on('end', () => {
                    fs.unlink(self.tmpFile, () => feed.close());
                });
        });
    } else {
        Object.keys(data).forEach((k) => {
            if (self.struct.indexOf(k) === -1) {
                self.struct.push(k);
            }
        });
        writeTo(self.tmpInput, data, () => feed.end());
    }
}

/**
 * Take `Object` and standardize it so each object will have the sames keys
 *
 * @name OBJStandardize
 * @alias standardize
 * @param {undefined} none
 * @returns {Object}
 */
export default {
    OBJStandardize,
};

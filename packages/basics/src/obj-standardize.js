import ezs from 'ezs';
import tmpFilepath from 'tmp-filepath';
import fs from 'fs';
import TXTParse from './txt-parse';
import { writeTo } from './utils';

function serializeObjects(data2, feed2) {
    if (!this.isLast()) {
        const buf = new Buffer(data2, 'base64');
        feed2.send(JSON.parse(buf.toString()));
    } else {
        feed2.close();
    }
}

function OBJStandardize(data1, feed1) {
    const self = this;
    if (!self.tmpFile) {
        self.tmpFile = tmpFilepath('.bin');
        self.struct = [];
        self.tmpHandle = ezs.createStream(ezs.objectMode());
        self.tmpHandle.pipe(ezs('pack'))
            .pipe(ezs.toBuffer())
            .pipe(ezs.compress())
            .pipe(fs.createWriteStream(self.tmpFile))
            .on('error', (e) => {
                throw e;
            });
    }

    if (self.isLast()) {
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
                feed1.write(vv);
            })
            .on('end', (d) => {
                fs.unlink(self.tmpFile, () => feed1.close());
            });
    } else {
        Object.keys(data1).forEach((k) => {
            if (self.struct.indexOf(k) === -1) {
                self.struct.push(k);
            }
        });
        writeTo(self.tmpHandle, data1, () => feed1.end());
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

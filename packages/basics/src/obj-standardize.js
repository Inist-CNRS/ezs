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
        self.tmpStream = fs.createWriteStream(self.tmpFile);
    }

    if (self.isLast()) {
        fs.createReadStream(self.tmpFile)
            .pipe(ezs(TXTParse, { separator: '\n' }))
            .pipe(ezs(serializeObjects))
            .pipe(ezs(function unserializeObjects(data3, feed3) {
                if (this.isLast()) {
                    fs.unlink(self.tmpFile, () => feed1.close());
                } else {
                    const vv = {};
                    self.struct.forEach((k) => {
                        if (!data3[k]) {
                            vv[k] = '';
                        } else {
                            vv[k] = data3[k];
                        }
                    });
                    feed1.write(vv);
                }
                feed3.end();
            }));
    } else {
        Object.keys(data1).forEach((k) => {
            if (self.struct.indexOf(k) === -1) {
                self.struct.push(k);
            }
        });
        writeTo(self.tmpStream,
            new Buffer(JSON.stringify(data1)).toString('base64').concat('\n'),
            () => feed1.end());
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

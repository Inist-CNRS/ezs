import { existsSync, writeFile, unlink } from 'fs';
import { resolve, normalize } from 'path';
import { tmpdir } from 'os';
import debug from 'debug';
import { set } from 'lodash';
import generate from 'nanoid/async/generate';
import nolookalikes from 'nanoid-dictionary/nolookalikes';

import { checksum } from './identify';

/**
 * Break the stream  if the control file cannot be checked
 *
 *
 * @name delegate
 * @param {String} [extension=.sid] the file extension to use
 * @param {String} [location=tmpdir()] the location directory to check the file
 * @param {String} [sid] the stream identifier
 * @returns {Object}
 */
export default async function breaker(data, feed) {
    if (this.isFirst()) {
        const extension = [].concat(this.getParam('extension', '.sid')).filter(Boolean).shift().toString();
        const location = [].concat(this.getParam('location', tmpdir())).filter(Boolean).shift().toString();
        let sid = [].concat(this.getParam('sid', this.getEnv('sid'))).filter(Boolean).shift().toString();
        if (!sid) {
            const envar = this.getEnv();
            sid = await generate(nolookalikes, 8);
            set(envar, 'sid', sid);
        }
        this.checkfile = resolve(normalize(location), sid + extension);
        if (!existsSync(this.checkfile)) {
            await writeFile(this.checkfile, checksum(sid));
        }
    }
    if (this.isLast()) {
        await unlink(this.checkfile);
        return feed.close();
    }
    if (!existsSync(this.checkfile)) {
        debug('ezs')(`Stream break, ${this.checkfile} no longer exists.`);
        return feed.close(data);
    }
    return feed.send(data);
}

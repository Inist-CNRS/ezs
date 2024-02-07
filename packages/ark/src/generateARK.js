import { set } from 'lodash';
import leveldown from 'leveldown';
import levelup from 'levelup';
import InistArk from 'inist-ark';
import reduce from 'async/reduce';
import { resolve } from 'path';

/**
 * Take `Object` object, and throw the same object but with an ARK
 *
 * @param {String} [target=ark] field name to insert ARK
 * @param {String} [subpublisher] Subpublisher
 * @param {String} [naan] NAAN
 * @param {String} [databasePath] Path for database to store generated ARKs
 * @returns {Object}
 */
export default function generateARK(data, feed) {
    const target = this.getParam('target', 'ark');
    const databasePath = this.getParam('databasePath');
    const subpublisher = this.getParam('subpublisher');
    const naan = this.getParam('naan');

    if (!this.ARK) {
        if (!naan) {
            return feed.stop(new Error('NAAN is not defined'));
        }

        if (!subpublisher) {
            return feed.stop(new Error('Subpublisher is not defined'));
        }
        this.ARK = new InistArk({ naan, subpublisher });
    }

    if (!this.db) {
        if (!databasePath) {
            return feed.stop(new Error('databasePath is not defined'));
        }
        this.db = levelup(leveldown(resolve(resolve(databasePath, './database.ark'))));
    }

    if (this.isLast()) {
        this.db.close();
        return feed.close();
    }


    return reduce([1, 2, 3], null, (memo, item, callback) => {
        if (memo) {
            return callback(null, memo);
        }
        const ark = this.ARK.generate();
        return this.db.get(ark, (errGet, val) => {
            if (!errGet && val) {
                return callback(null, false);
            }
            return callback(null, ark);
        });
    }, (errReduce, ark) => {
        if (errReduce) {
            return feed.stop(new Error('Unable to generate an ARK unique identifier after 3 attempts.'));
        }
        return this.db.put(ark, true, (errPut) => {
            if (errPut) {
                return feed.stop(errPut);
            }
            set(data, target, ark);
            return feed.send(data);
        });
    });
}

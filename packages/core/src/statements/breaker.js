import debug from 'debug';
import { checkFusible } from '../fusible.js';
/**
 * Break the stream  if the control file cannot be checked
 *
 *
 * @name delegate
 * @param {String} [fusible] file to check
 * @returns {Object}
 */
export default async function breaker(data, feed) {
    if (this.isFirst()) {
        this.fusible = this.getParam('fusible');
    }
    if (this.isLast()) {
        return feed.close();
    }
    const check = await checkFusible(this.fusible);
    if (!check) {
        debug('ezs:info')(`Stream break, ${this.fusible} no longer active.`);
        return feed.close(data);
    }
    return feed.send(data);
}

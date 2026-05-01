import debug from 'debug';
import { checkFusible, watchFusible } from '../fusible.js';
/**
 * Break the stream  if the control file cannot be checked
 *
 * @name breaker
 * @param {String} [fusible] file to check
 * @returns {Object}
 */
export default async function breaker(data, feed) {
    if (this.isFirst()) {
        this.ended = false;
        this.fusible = this.getParam('fusible');
        this.handle  = await watchFusible(this.fusible, () => {
            if (!this.ended) {
                debug('ezs:info')(`Stream cancel, ${this.fusible} no longer active.`);
                return feed.close();
            }
        });
    }
    if (this.isLast()) {
        this.ended = true;
        if (this.handle) {
            this.handle();
        }
        return feed.close();
    }
    const check = await checkFusible(this.fusible);
    if (!check) {
        this.ended = true;
        debug('ezs:info')(`Stream break, ${this.fusible} no longer active.`);
        return feed.close(data);
    }
    return feed.send(data);
}

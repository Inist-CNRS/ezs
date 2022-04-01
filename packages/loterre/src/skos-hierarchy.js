import { createStore } from '@ezs/store';
import has from 'lodash.has';
import get from 'lodash.get';
import set from 'lodash.set';


/**
 * @name writeHierarchy
 * @param {Object} data
 * @param {Object} feed
 * @param {string} property
 * @param {Object} store
 * @param {number} weight
 * @private
 */
async function writeHierarchy(data, feed, uriPath, linkPath, labelPath, store, weight) {
    const target = get(data, linkPath);
    for (let i = 0; i < target.length; i += 1) {
        const obj = {};
        obj.source = get(data, labelPath);
        obj.target = get(target[i], labelPath);
        obj.weight = weight;

        const key = `${get(data, uriPath)}#${get(target[i], uriPath)}`;
        // check if key exist else write and add to db.
        const checkIfWrited = await store.get(key);
        if (!checkIfWrited) {
            feed.write(obj);
            await store.add(key, '');
        }
    }
}

/**
 * Output:
 *
 * ```json
 *  [
 *      {
 *          "source": ...,
 *          "target": ...,
 *          "weight": ...
 *      }
 *  ]
 * ```
 * @name SKOSHierarchy
 * @param {String} [language=en] Choose language of `prefLabel`
 * @returns {Promise} Return fed Object
 */
async function SKOSHierarchy(data, feed) {

    if (!this.store) {
        this.store = createStore(this.ezs, 'skos_hierarchy_store');
        await this.store.reset();
    }
    if (this.isLast()) {
        await this.store.close();
        feed.close();
    } else {
        const paths = Array()
            .concat(this.getParam('path'))
            .filter(path => has(data, path));
        const uriPath = Array()
            .concat(this.getParam('uri', 'rdf$about'))
            .filter(Boolean)
            .shift();
        const labelPath = Array()
            .concat(this.getParam('label', 'skos$prefLabel'))
            .filter(Boolean)
            .shift();

        // weight calculation
        const weight = paths.reduce((prev, path) => (get(data, path).length + prev));
        const values = await Promise.all(paths.map(linkPath =>
            writeHierarchy(data, feed, uriPath, linkPath, labelPath, this.store, weight)
        ));
        feed.end();
    }
}
export default {
    SKOSHierarchy,
};

/* istanbul ignore file */
import { createStore } from '@ezs/store';
import has from 'lodash.has';
import get from 'lodash.get';
import set from 'lodash.set';


/**
 * @name writeEdge
 * @param {Object} data
 * @param {Object} feed
 * @param {string} property
 * @param {Object} store
 * @param {string} lang
 * @param {number} weight
 * @private
 */
async function writeEdge(data, feed, uriPath, linkPath, labelPath, store, weight) {
    const target = get(data, linkPath);
    for (let i = 0; i < target.length; i += 1) {
        const key = `${get(data, uriPath)}#${get(target[i], uriPath)}`;
        const attrs = {
            label: get(data, labelPath),
            source: get(data, uriPath),
            target: get(target[i], labelPath),
            weight: `${weight}.0`,
        };
        const edge = { name: 'edge', attrs };
        const checkIfWrited = await store.get(key);
        if (!checkIfWrited) {
            feed.write(edge);
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
 * @name SKOSToGexf
 * @param {String} [language=en] Choose language of `prefLabel`
 * @returns {Promise} Return fed Object
 */
async function SKOSToGexf(data, feed) {
    const lang = this.getParam('language', 'en');

    if (!this.store) {
        this.store = createStore(this.ezs, 'skos_hierarchy_store');
        this.store.reset();
        this.storeNode = createStore(this.ezs, 'skos_hierarchyNode_store');
        this.storeNode.reset();
    }
    if (this.isLast()) {
        await this.store.close();
        const nodes = { nodes: [] };
        this.storeNode.cast().on('data', (chunk) => {
            const attrs = {
                label: chunk.value[0].label,
                id: chunk.value[0].id,
            };
            const node = { name: 'node', attrs };
            nodes.nodes.push(node);
        }).on('end', async () => {
            feed.write(nodes);
            await this.storeNode.close();
            feed.close();
        });
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

        const weight = paths.reduce((prev, path) => (get(data, path).length + prev));
        const values = await Promise.all(paths.map(linkPath =>
            writeEdge(data, feed, uriPath, linkPath, labelPath, this.store, weight)
        ));

        const obj = {};
        obj.id = get(data, uriPath);
        obj.target = get(data, labelPath);
        await this.storeNode.add(obj.id, obj);
        feed.end();
    }
}
export default {
    SKOSToGexf,
};

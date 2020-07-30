/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-multi-spaces */
/* eslint-disable max-len */
/* eslint-disable no-console */
import { createStore } from '../../analytics/src/store';

/**
 * @param {string} property
 * @param {Object} obj
 */
function checkIfPropertyExist(property, obj) {
    return (typeof (obj[property]) !== 'undefined');
}

/**
 * @name writeEdge
 * @param {Object} data
 * @param {Object} feed
 * @param {string} property
 * @param {Object} store
 * @param {string} lang
 * @param {number} weight
 */


async function writeEdge(data, feed, property, store, lang, weight) {
    for (let i = 0; i < data[property].length; i += 1) {
        let key         = `${data.rdf$about}#${data[property][i].key}`;
        let attrs = {
            label: data[`prefLabel@${lang}`],
            source: data.rdf$about,
            target: data[property][i].label,
            weight: `${weight}.0`,
        };
        let edge = { name: 'edge', attrs };
        const checkIfWrited  =  await store.get(key);
        if (!checkIfWrited) {
            feed.write(edge);
            await store.add(key, '');
        }
    }
}

/**
 * SKOSHierarchy
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
 * @param {String} [language=en] Choose langauge of prefLabel
 * @returns {Promise} Return fedd Object
 */
async function SKOSToGexf(data, feed) {
    const lang = this.getParam('language', 'en');

    if (!this.store) {
        this.store = createStore(this.ezs, 'skos_hierarchy_store');
        this.storeNode = createStore(this.ezs, 'skos_hierarchyNode_store');
    }
    if (this.isLast()) {
        this.store.close();
        let nodes = { nodes: [] };
        this.storeNode.cast().on('data', (chunk) => {
            let attrs = {
                label: chunk.value[0].label,
                id: chunk.value[0].id,
            };
            let node = { name: 'node', attrs };
            nodes.nodes.push(node);
        }).on('end', () => {
            feed.write(nodes);
            this.storeNode.close();
            feed.close();
        });
    } else {
        // weight calculation
        let weight = 0;
        if (checkIfPropertyExist('narrower', data)) {
            weight += data.narrower.length;
        }
        if (checkIfPropertyExist('broader', data)) {
            weight += data.broader.length;
        }
        if (checkIfPropertyExist('related', data)) {
            weight += data.related.length;
        }

        if (checkIfPropertyExist('narrower', data)) {
            await writeEdge(data, feed, 'narrower', this.store, lang, weight);
        }

        if (checkIfPropertyExist('broader', data)) {
            await writeEdge(data, feed, 'broader', this.store, lang, weight);
        }

        if (checkIfPropertyExist('related', data)) {
            await writeEdge(data, feed, 'related', this.store, lang, weight);
        }

        let obj     = {};
        obj.id      = data.rdf$about;
        obj.label   = data[`prefLabel@${lang}`];
        await this.storeNode.add(obj.id, obj);

        feed.end();
    }
}
export default {
    SKOSToGexf,
};

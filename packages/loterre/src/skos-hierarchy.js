import { createStore } from '@ezs/store';

/**
 * @param {string} property
 * @param {Object} obj
 * @private
 */
function checkIfPropertyExist(property, obj) {
    return (typeof (obj[property]) !== 'undefined');
}

/**
 * @name writeHierarchy
 * @param {Object} data
 * @param {Object} feed
 * @param {string} property
 * @param {Object} store
 * @param {string} lang
 * @param {number} weight
 * @private
 */
async function writeHierarchy(data, feed, property, store, lang, weight) {
    for (let i = 0; i < data[property].length; i += 1) {
        const obj = {};
        obj.source = data[`prefLabel@${lang}`];
        obj.target = data[property][i].label;
        obj.weight = weight;
        const key = `${data.rdf$about}#${data[property][i].key}`;
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
    const lang = this.getParam('language', 'en');
    const addNodes = this.getParam('addNodes', false);

    if (!this.store) {
        this.store = createStore(this.ezs, 'skos_hierarchy_store');
        if (addNodes) {
            this.storeNode = createStore(this.ezs, 'skos_hierarchyNode_store');
        }
    }
    if (this.isLast()) {
        this.store.close();
        if (addNodes) {
            const nodes = [];
            this.storeNode.cast().on('data', (chunk) => {
                nodes.push({ id: chunk.value[0].id, label: chunk.value[0].id });
            }).on('end', () => {
                feed.write(nodes);
                this.storeNode.close();
                feed.close();
            });
        } else {
            feed.close();
        }
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
            await writeHierarchy(data, feed, 'narrower', this.store, lang, weight);
        }

        if (checkIfPropertyExist('broader', data)) {
            await writeHierarchy(data, feed, 'broader', this.store, lang, weight);
        }

        if (checkIfPropertyExist('related', data)) {
            await writeHierarchy(data, feed, 'related', this.store, lang, weight);
        }

        if (addNodes) {
            const obj = {};
            obj.id = data[`prefLabel@${lang}`];
            obj.label = data[`prefLabel@${lang}`];
            await this.storeNode.add(obj.id, obj);
        }

        feed.end();
    }
}
export default {
    SKOSHierarchy,
};

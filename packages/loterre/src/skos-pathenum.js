import { createStore } from '@ezs/store';
import has from 'lodash.has';
import get from 'lodash.get';
import set from 'lodash.set';

/**
 * @name getBroaderOrNarrowerLst
 * @param {string} broaderOrNarrower
 * @param {Object} concept
 * @param {Object} store
 * @param {string} lang
 * @returns {Promise} Returns object
 * @private
 */
async function getBroaderOrNarrowerLst(broaderOrNarrower, recursion, concept, store) {
    const result = [];
    const values = get(concept, broaderOrNarrower);
    if (values) for (let i = 0; i < values.length; i += 1) {
        const key = concept[broaderOrNarrower][i];
        const response = await store.get(key);
        if (response !== 'undefined' && Array.isArray(response)) {
            result.push(response[0]);
            if (recursion) {
                const deeper = await getBroaderOrNarrowerLst(broaderOrNarrower, response[0], store);
                result.push(...deeper);
            }
        }
    }
    return result.filter(Boolean);
}

/**
 * @name getBroaderAndNarrower
 * @param {Object} data
 * @param {Object} feed
 * @returns {Promise} Returns object
 * @private
 */
async function getBroaderAndNarrower(data, feed) {
    try {
        if (this.isLast()) {
            return feed.close();
        }
        const store = this.getEnv();
        const concept = data.value[0];
        const paths = Array()
            .concat(this.getParam('path'))
            .filter(path => has(concept, path));
        const uriPath = Array()
            .concat(this.getParam('uri', 'rdf$about'))
            .filter(Boolean)
            .shift();
        const labelPath = Array()
            .concat(this.getParam('label', 'skos$prefLabel'))
            .filter(Boolean)
            .shift();
        const recursion = Boolean(this.getParam('recursion', false));


        const values = await Promise.all(paths.map(path => getBroaderOrNarrowerLst(path, recursion, concept, store)));
        values.forEach((foundConcepts, i) => set(concept, paths[i], foundConcepts.map(foundConcept => {
            const obj = {};
            set(obj, uriPath, get(foundConcept, uriPath));
            set(obj, labelPath, get(foundConcept, labelPath));
            return obj;
        })));
        return feed.send(concept);
    }
    catch(e) {
        return feed.stop(e);
    }
}

async function SKOSPathEnum(data, feed) {
    try {
        if (!this.store) {
            this.store = createStore(this.ezs, 'skos_pathenum_store');
            await this.store.reset();
        }
        if (this.isLast()) {
            const stream = await this.store.cast();
            const output = stream
                .pipe(this.ezs(getBroaderAndNarrower, {
                    path: this.getParam('path', 'skos$broader'),
                    uri: this.getParam('uri', 'rdf$about'),
                    label: this.getParam('label', 'skos$prefLabel'),
                    recursion: this.getParam('recursion', false),
                }, this.store))
                .on('end', async () => {
                    await this.store.close();
                    feed.close();
                });
            ;
            await feed.flow(output);
            return;
        }
        await this.store.add(data.rdf$about, data);
        feed.end();
    } catch(e) {
        feed.stop(e);
    }
}

/**
 * Take an `Object` and transform "broader","narrower" and "related"
 * properties to an 'Object' containing the `prefLabel` and `rdf$about`
 *
 * ```
 * <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:skos="http://www.w3.org/2004/02/skos/core#">
 *
 *      <skos:Concept rdf:about="http://example.com/dishes#potatoBased">
 *           <skos:prefLabel xml:lang="fr">Plats à base de pomme de terre</skos:prefLabel>
 *           <skos:prefLabel xml:lang="en">Potato based dishes</skos:prefLabel>
 *           <skos:prefLabel xml:lang="de">Kartoffelgerichte</skos:prefLabel>
 *           <skos:inScheme rdf:resource="http://example.com/dishes"/>
 *           <skos:topConceptOf rdf:resource="http://example.com/dishes"/>
 *       </skos:Concept>
 *
 *       <skos:Concept rdf:about="http://example.com/dishes#fries">
 *           <skos:prefLabel xml:lang="fr">Frites</skos:prefLabel>
 *           <skos:prefLabel xml:lang="en">French fries</skos:prefLabel>
 *           <skos:prefLabel xml:lang="de">Französisch frites</skos:prefLabel>
 *           <skos:inScheme rdf:resource="http://example.com/dishes"/>
 *           <skos:broader rdf:resource="http://example.com/dishes#potatoBased"/>
 *       </skos:Concept>
 *
 *       <skos:Concept rdf:about="http://example.com/dishes#mashed">
 *           <skos:prefLabel xml:lang="fr">Purée de pomme de terre</skos:prefLabel>
 *           <skos:prefLabel xml:lang="en">Mashed potatoes</skos:prefLabel>
 *           <skos:prefLabel xml:lang="de">Kartoffelpüree</skos:prefLabel>
 *           <skos:inScheme rdf:resource="http://example.com/dishes"/>
 *           <skos:broader rdf:resource="http://example.com/dishes#potatoBased"/>
 *       </skos:Concept>
 *
 * </rdf:RDF>
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = loterre
 *
 * [concat]
 * [XMLParse]
 * separator = /rdf:RDF/skos:Concept
 * [SKOSObject]
 *
 * [SKOSPathEnum]
 * path = broader
 * path = narrower
 * label = prefLabel@fr
 * ```
 *
 * Output:
 *
 * ```json
 *   [
 *    {
 *       "rdf$about": "http://example.com/dishes#fries",
 *       "prefLabel@fr": "Frites",
 *       "prefLabel@en": "French fries",
 *       "prefLabel@de": "Französisch frites",
 *       "inScheme": "http://example.com/dishes",
 *       "broader": [ [{ "rdf$about": "http://example.com/dishes#potatoBased", "prefLabel@fr": "Plats à base de pomme de terre" }] ]
 *     },
 *     {
 *       "rdf$about": "http://example.com/dishes#mashed",
 *       "prefLabel@fr": "Purée de pomme de terre",
 *       "prefLabel@en": "Mashed potatoes",
 *       "prefLabel@de": "Kartoffelpüree",
 *       "inScheme": "http://example.com/dishes",
 *       "broader": [ [{ "rdf$about": "http://example.com/dishes#potatoBased", "prefLabel@fr": "Plats à base de pomme de terre" }] ]
 *     },
 *     {
 *       "rdf$about": "http://example.com/dishes#potatoBased",
 *       "prefLabel@fr": "Plats à base de pomme de terre",
 *       "prefLabel@en": "Potato based dishes",
 *       "prefLabel@de": "Kartoffelgerichte",
 *       "inScheme": "http://example.com/dishes",
 *       "topConceptOf": "http://example.com/dishes",
 *       "narrower": [
 *          { "rdf$about": "http://example.com/dishes#fries", "prefLabel@fr": "Frites" },
 *          {
 *              "rdf$about": "http://example.com/dishes#mashed",
 *              "prefLabel@fr": "Purée de pomme de terre"
 *          }
 *       ]
 *     }
 *   ]
 * ```
 *
 * @name SKOSPathEnum
 * @param {String} [path=skos$broader] Choose one or more paths to enum
 * @param {String} [path=rdf$about] Choose one path to select uri from found concepts
 * @param {String} [path=skos$prefLabel] Choose one path to select label from found concepts
 * @param {String} [recursion=false] Follow path to enum (usefull for broaderConcept)
 * @returns {Object} Returns object
*/
export default {
    SKOSPathEnum,
};

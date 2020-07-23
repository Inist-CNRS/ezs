/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-const */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-multi-spaces */
/* eslint-disable max-len */
/* eslint-disable no-console */
import ezs from '../../core/src';
import { createStore } from '../../analytics/src/store';

function checkProperty(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
}

async function getBroaderOrNarrowerLst(broaderOrNarrower, concept, store, lang) {
    const result = [];
    for (let i = 0; i < concept[broaderOrNarrower].length; i += 1) {
        const key   = concept[broaderOrNarrower][i];
        const response  =  await store.get(key);
        const obj       = {};
        obj.key         = key;
        obj.label       = response[0][`prefLabel@${lang}`];
        if (obj.label === undefined) {
            // search prefLabel property :
            const conceptKeys = (Object.keys(response[0]));
            const regex = /^prefLabel@/;
            for (let objKey of conceptKeys) {
                if (objKey.match(regex)) {
                    let llang   = objKey.replace('prefLabel@', '');
                    obj.label   = `${response[0][objKey]} (${llang})`;
                    // privilege english lang
                    if (llang === 'en') {
                        break;
                    }
                }
            }
        }
        result.push(obj);
    }
    return (result);
}

const transformConcept = (feed, store, lang = 'en', resolveFlag = false) => new Promise(
    (resolve, reject) => store.cast()
        .on('data', async (chunk) => {
            resolveFlag     = false;
            const concept   = chunk.value[0];
            // check if has broader and narrower
            if (checkProperty(concept, 'narrower') && checkProperty(concept, 'broader')) {
                concept.broader     = await getBroaderOrNarrowerLst('broader', concept, store, lang);
                concept.narrower    = await getBroaderOrNarrowerLst('narrower', concept, store, lang);
                feed.write(concept);
            } else if (checkProperty(concept, 'narrower') && !checkProperty(concept, 'broader')) { // the top element in the hierarchy
                concept.narrower    = await getBroaderOrNarrowerLst('narrower', concept, store, lang);
                feed.write(concept);
            } else if (!checkProperty(concept, 'narrower') && checkProperty(concept, 'broader')) { // the last element in the hierarchy
                concept.broader     = await getBroaderOrNarrowerLst('broader', concept, store, lang);
                feed.write(concept);
            }// if orphan concept
            resolveFlag = true;
        }).on('end', () => {
            function checkFlag() {
                if (resolveFlag === false) {
                    console.log('teeeest');
                    window.setTimeout(checkFlag, 1000);
                } else {
                    resolve();
                }
            }
            window.setTimeout(checkFlag, 5000);
        }).on('error', (e) => {
            reject(e);
        }),
);

/**
 * Takes an `Object` and ....
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
 * language = fr
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { ... }
 *  ]
 * ```
 *
 * @name SKOSPathEnum
 * @param {String} [language=en] Choose langauge of prefLabel
 * @returns {Object}
 */
async function SKOSPathEnum(data, feed) {
    const lang = this.getParam('language', 'en');
    if (this.isFirst()) {
        this.store = createStore(ezs, 'skos_pathenum_store');
    }
    if (this.isLast()) {
        await transformConcept(feed, this.store, lang);
        this.store.empty();
        return feed.close();
    }
    if (data) {
        // check if concept contains borader or narrower (orphan) otherwise write concept
        if (!checkProperty(data, 'broader') && !checkProperty(data, 'narrower')) {
            feed.write(data);
        }
        await this.store.add(data.rdf$about, data);
    }
    feed.end();
}

export default {
    SKOSPathEnum,
};

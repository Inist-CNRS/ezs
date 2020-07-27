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

async function BroaderAndNarrower(data, feed) {
    let store = this.getEnv();
    const lang = this.getParam('language', 'en');
    if (data) {
        const concept = data.value[0];
        if (checkProperty(concept, 'narrower') && checkProperty(concept, 'broader')) {
            concept.broader     = await getBroaderOrNarrowerLst('broader', concept, store, lang);
            concept.narrower    = await getBroaderOrNarrowerLst('narrower', concept, store, lang);
        } else if (checkProperty(concept, 'narrower') && !checkProperty(concept, 'broader')) { // the top element in the hierarchy
            concept.narrower    = await getBroaderOrNarrowerLst('narrower', concept, store, lang);
        } else if (!checkProperty(concept, 'narrower') && checkProperty(concept, 'broader')) { // the last element in the hierarchy
            concept.broader     = await getBroaderOrNarrowerLst('broader', concept, store, lang);
        }
        return feed.send(concept);
    }
    if (this.isLast()) {
        return feed.close();
    }
}

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
    if (!this.store) {
        this.store = createStore(this.ezs, 'skos_pathenum_store');
    }
    if (this.isLast()) {
        this.store.cast().pipe(this.ezs(BroaderAndNarrower, { language: this.getParam('language', 'en') }, this.store)).on('data', (chunk) => {
            feed.write(chunk);
        }).on('end', () => feed.close());
    } else {
        await this.store.add(data.rdf$about, data);
        feed.end();
    }
}
export default {
    SKOSPathEnum,
};

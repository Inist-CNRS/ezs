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
export default function SKOSPathEnum(data, feed) {
    const lang = this.getParam('language', 'en');
    if (this.isFirst()) {
        // ...
    }
    if (this.isLast()) {
        // ...
        return feed.close();
    }
    return feed.send(data);
}

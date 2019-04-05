import validUrl from 'valid-url';
import get from 'lodash.get';

// import prefixes from '../../common/prefixes'; // IN LODEX
const defaultPrefixes = {
    bibo: 'http://purl.org/ontology/bibo/',
    dbpedia: 'http://dbpedia.org/ontology/',
    dcdoc: 'http://dublincore.org/documents/',
    dcmitype: 'http://purl.org/dc/dcmitype/',
    dcterms: 'http://purl.org/dc/terms/',
    foaf: 'http://xmlns.com/foaf/0.1/#',
    geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
    gn: 'http://www.geonames.org/ontology/ontology_v3.1.rdf/',
    istex: 'https://data.istex.fr/ontology/istex#',
    owl: 'http://www.w3.org/2002/07/owl#',
    prov: 'http://www.w3.org/ns/prov#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    schema: 'http://schema.org/',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    time: 'http://www.w3.org/TR/owl-time/',
    xfoaf: 'http://www.foafrealm.org/xfoaf/0.1/',
    xml: 'http://www.w3.org/XML/1998/namespace',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
};

/**
 * Create a JSONLD context with prefixes and istexQuery informations in config.json
 *
 * @param   {Object}    config      LODEX configuration (`istexQuery`: `{linked, context}`)
 * @param   {Object}    prefixes    Semantic web prefixes (`bibo`, `dcterms`, etc.)
 * @return JSONLD context with properties URI
 */
function getContext(config, prefixes) {
    const context = {};

    Object.keys(config.istexQuery.context).forEach((v) => {
        const propertyValue = config.istexQuery.context[v];

        if (validUrl.isWebUri(propertyValue)) {
            context[v] = propertyValue;
            return context[v];
        }

        const istexProperty = propertyValue.split(':').map(e => e.trim());

        if (!prefixes[istexProperty[0]]) {
            // eslint-disable-next-line no-console
            console.error(
                `property "${v}" in istexQuery ("${
                    istexProperty[0]
                }") is not found in prefixes`,
            );
            context[v] = 'unknown:';
        }

        context[v] = `${prefixes[istexProperty[0]]}${istexProperty[1]}`;
        return context[v];
    });

    if (!config.istexQuery.linked) {
        // eslint-disable-next-line no-console
        console.error('istexQuery.linked was not found in configuration');
    } else if (context[config.istexQuery.linked] === undefined) {
        // eslint-disable-next-line no-console
        console.error(
            'convertToExtendedJsonLd',
            `${config.istexQuery.linked} not found in context`,
        );
    }

    context[config.istexQuery.linked] = {
        '@id': context[config.istexQuery.linked],
        '@type': '@id',
    };

    return context;
}

const checkWeb = (data) => {
    if (validUrl.isWebUri(data)) {
        return { '@id': data };
    }
    return data;
};

const formatData = (data) => {
    if (!Array.isArray(data)) {
        return checkWeb(data);
    }
    return data.map(e => checkWeb(e));
};

/**
 * Convert the result of an ISTEX query to an extended JSON-LD
 *
 * @param {Object}  [config={}]  LODEX configuration (with `istexQuery`)
 * @param {Object}  [prefixes={bibo,dbpedia,dcterms,..}]    LOD prefixes
 */
export default function convertToExtendedJsonLd(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const config = this.getParam('config', {});
    const prefixes = this.getParam('prefixes', defaultPrefixes);

    if (!this.searchKeys) {
        this.context = getContext(config, prefixes);
        this.searchKeys = Object.keys(this.context).filter(
            v => !Object.keys(data).includes(v) && v !== config.istexQuery.linked,
        );
    }
    const newHit = {
        ...data,
    };
    newHit['@id'] = `https://api.istex.fr/${data.arkIstex}`;
    newHit[config.istexQuery.linked] = data.uri;

    this.searchKeys.forEach((key) => {
        const dataFromKey = get(data, key);
        newHit[key] = formatData(dataFromKey);
    });

    const doc = {
        '@context': this.context,
        '@graph': [newHit],
    };

    return feed.send(doc);
}

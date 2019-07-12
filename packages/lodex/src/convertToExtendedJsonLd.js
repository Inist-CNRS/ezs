import validUrl from 'valid-url';
import get from 'lodash.get';

// import prefixes from '../../common/prefixes'; // IN LODEX
import defaultPrefixes from '../prefixes.json';

/*
 * Create a JSONLD context with prefixes and istexQuery informations in config.json
 *
 * @param {String}  linked          ISTEX field which is linked to the resources
 * @param {Object}  queryContext    ISTEX fields and their associated semantic properties
 * @param {Object}  prefixes        Semantic web prefixes (`bibo`, `dcterms`, etc.)
 * @return JSONLD context with properties URI
 */
function getContext(linked, queryContext, prefixes) {
    const context = {};

    Object.keys(queryContext).forEach((v) => {
        const propertyValue = queryContext[v];

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

    if (!linked) {
        // eslint-disable-next-line no-console
        console.error('linked was not found in configuration');
    } else if (context[linked] === undefined) {
        // eslint-disable-next-line no-console
        console.error(
            'convertToExtendedJsonLd',
            `${linked} not found in context`,
        );
    }

    context[linked] = {
        '@id': context[linked],
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
 * Convert the result of an ISTEX query to an extended JSON-LD.
 *
 * Every hit must contain the URI of original lodex resource, linked to the
 * query.
 *
 * @param {String}  linked  ISTEX field which is linked to the resources
 * @param {Object}  [context={}]    ISTEX fields and their associated semantic properties
 * @param {Object}  [prefixes={bibo,dbpedia,dcterms,..}]    LOD prefixes
 * @name convertToExtendedJsonLd
 */
export default function convertToExtendedJsonLd(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const linked = this.getParam('linked');
    const queryContext = this.getParam('context', {});
    const prefixes = this.getParam('prefixes', defaultPrefixes);

    if (!this.searchKeys) {
        this.context = getContext(linked, queryContext, prefixes);
        this.searchKeys = Object.keys(this.context).filter(
            v => !Object.keys(data).includes(v) && v !== linked,
        );
    }
    const newHit = {
        ...data,
    };
    newHit['@id'] = `https://api.istex.fr/${data.arkIstex}`;
    newHit[linked] = data.uri;

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

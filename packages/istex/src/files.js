import URL from 'url';

/**
 * Take an Object with ISTEX `id` and generate an object for each file
 *
 * @name ISTEXFiles
 * @see ISTEXScroll
 * @param {string} [fulltext=pdf]    typology of the document to save
 * @param {string} [metadata=json]   format of the files to save
 * @param {string} [enrichment]   enrichment of the document to save
 * @param {string} [sid="ezs-istex"]  User-agent identifier
 * @returns {Array}
 */
function ISTEXFiles(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const typology = this.getParam('fulltext');
    const typologies = Array.isArray(typology) ? typology : [typology];
    const record = this.getParam('metadata', 'json');
    const records = Array.isArray(record) ? record : [record];
    const enrichment = this.getParam('enrichment');
    const enrichments = Array.isArray(enrichment) ? enrichment : [enrichment];
    const sid = this.getParam('sid', 'ezs-istex');
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
    };
    if (!data.hits && !data.arkIstex) {
        throw new Error(
            '[ISTEXFetch] or [ISTEXScroll] should be defined'
            + ' before this statement.',
        );
    }
    if (records.length === 0 && typologies.length === 0) {
        throw new Error('metadata or fulltext must be defined as parameter.');
    }

    const identifiers = data.hits ? data.hits : [data];
    identifiers.map(({ id, arkIstex }) => [
        ...enrichments.filter(Boolean).map(extension => `${arkIstex}/enrichment.${extension}`),
        ...typologies.filter(Boolean).map(extension => `${arkIstex}/fulltext.${extension}`),
        ...records.map(extension => `${arkIstex}/record.${extension}`),
    ].forEach((pathname) => {
        const urlObj = {
            ...location,
            pathname,
            query: {
                sid,
            },
        };
        const cmdObj = {
            id,
            arkIstex,
            name: pathname.replace('ark:', ''),
            source: URL.format(urlObj),
        };
        feed.write(cmdObj);
    }));
    feed.end();
}

export default {
    ISTEXFiles,
};

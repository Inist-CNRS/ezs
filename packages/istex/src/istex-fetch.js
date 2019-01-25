import URL from 'url';
import OBJ from 'dot-prop';
import fetch from 'fetch-with-proxy';
import QueryString from 'qs';
import { newValue } from './utils';

/**
 * Take `Object` with `id` and returns the document's metadata
 *
 * @example <caption>Input:</caption>
 * [{
 *   id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
 * }, {
 *   id: 'ark:/67375/QHD-T00H6VNF-0',
 * }]
 *
 * @example <caption>will produce two JSON records.</caption>
 * .pipe(ezs('ISTEXFetch', { source: 'id' }))
 *
 * @name ISTEXFetch
 * @param {string} [source="id"]    Field to use to fetch documents
 * @param {string} target
 * @param {string} [id=data.id]     ISTEX Identifier of a document
 * @param {string} [sid="ezs-istex"]    User-agent identifier
 * @returns {Array<Object>}
 */
function ISTEXFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source', 'id');
    const target = this.getParam('target');
    const id = this.getParam('id', OBJ.get(data, source, data));
    const sid = this.getParam('sid', 'ezs-istex');
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
    };
    if (id.length === 40) {
        location.pathname = '/document/'.concat(id);
    } else if (id.search(/^ark:/) === 0) {
        location.pathname = String(id).concat('/record.json');
    } else {
        throw new Error('Unexpected id.');
    }
    const parameters = {
        sid,
    };
    const urlObj = {
        ...location,
        search: QueryString.stringify(parameters),
    };
    const urlStr = URL.format(urlObj);
    fetch(urlStr)
        .then(response => response.json())
        .then((json) => {
            if (json._error) {
                throw new Error(json._error);
            }
            return feed.send(newValue(json, target, data));
        })
        .catch((err) => {
            err.url = urlStr;
            err.input = data;
            err.target = target;
            feed.send(err);
        });
}

export default {
    ISTEXFetch,
};

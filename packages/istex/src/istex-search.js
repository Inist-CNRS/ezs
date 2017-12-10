import URL from 'url';
import OBJ from 'dot-prop';
import fetch from 'omni-fetch';
import QueryString from 'qs';
import { feedWrite } from './utils';

function ISTEXSearch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source', 'query');
    const target = this.getParam('target');
    const query = OBJ.get(data, source, data);
    const sid = this.getParam('sid', 'ezs-istex');
    const limit = Number(this.getParam('limit'));
    const size = Number(this.getParam('size', 2000));
    const scroll = this.getParam('duration', '30s');
    const field = this.getParam('field', ['doi']);
    const fields = Array.isArray(field) ? field : [field];
    const output = fields.map(e => /\w+/.exec(e)[0]).join();
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
        pathname: '/document/',
    };
    const parameters = {
        q: query,
        scroll,
        output,
        size,
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
            if (!json.total) {
                return feed.send(new Error('No result.'));
            }
            // first Page
            feedWrite(feed, json, target, data);
            const { scrollId } = json;
            const scrollUrl = URL.format({
                ...location,
                search: QueryString.stringify({
                    ...parameters,
                    scrollId,
                }),
            });
            // all other pages
            const pages = Array(Math.ceil(json.total / size) - 1).map(() => scrollUrl).fill(scrollUrl);
            if (limit) {
                pages.slice(0, limit - 1).forEach(pageURL => feedWrite(feed, pageURL, target, data));
            } else {
                pages.forEach(pageURL => feedWrite(feed, pageURL, target, data));
            }
            return feed.end();
        }).catch((err) => {
            feed.send(err);
        });
}

export default {
    ISTEXSearch,
};

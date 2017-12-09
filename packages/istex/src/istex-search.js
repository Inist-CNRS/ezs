import URL from 'url';
import fetch from 'omni-fetch';
import QueryString from 'qs';


function ISTEXSearch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const sid = this.getParam('sid', 'ezs-istex');
    const limit = Number(this.getParam('limit'));
    const size = Number(this.getParam('size', 2000));
    const scroll = this.getParam('duration', '30s');
    const field = this.getParam('field', ['doi']);
    const fields = Array.isArray(field) ? field : [field];
    const output = fields.map(e => /\w+/.exec(e)[0]).join();
    const q = this.getParam('query', data.query || '');
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
        pathname: '/document/',
    };
    const parameters = {
        q,
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
            feed.write(json);
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
                pages.slice(0, limit - 1).forEach(pageURL => feed.write(pageURL));
            } else {
                pages.forEach(pageURL => feed.write(pageURL));
            }
            return feed.end();
        }).catch((err) => {
            feed.send(err);
        });
}

export default {
    ISTEXSearch,
};

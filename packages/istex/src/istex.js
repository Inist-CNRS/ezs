import ezs from 'ezs';
import from from 'from';

function ISTEX(data, feed) {
    const query = this.getParam('query', data.query || []);
    const identifier = this.getParam('id', data.id || []);
    const queries = Array.isArray(query) ? query : [query];
    const identifiers = Array.isArray(identifier) ? identifier : [identifier];

    if (this.isLast()) {
        return feed.close();
    }
    from(queries)
        .pipe(ezs(ISTEXQuery))
        .pipe(ezs(serializeObjects))

    feed.send(data);
}

export default {
    ISTEX,
};

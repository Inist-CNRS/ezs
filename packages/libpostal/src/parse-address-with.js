import postal from '@cymen/node-postal';
import get from 'lodash.get';
import set from 'lodash.set';
import clone from 'lodash.clone';

const parse = (input) => ({
    id: input,
    value: postal.parser
        .parse_address(String(input).trim())
        .reduce((obj, cur) => ({ ...obj, [cur.component]: cur.value }), {}),
});

export default function parseAddressWith(data, feed) {
    const paths = []
        .concat(this.getParam('path'))
        .filter(Boolean);
    if (this.isLast()) {
        return feed.close();
    }
    const tada = clone(data);
    paths.forEach((path) => {
        const value = get(data, path);
        if (Array.isArray(value)) {
            return set(tada, path, value.map(parse));
        }
        return set(tada, path, parse(value));
    });
    return feed.send(tada);
}

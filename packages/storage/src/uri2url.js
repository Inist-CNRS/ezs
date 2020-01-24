import { hostname } from 'os';
import { isURI } from './uri';

/**
 * With a `String`, containing a URI throw the URI with his hostname
 *
 * @returns {String}
 */
export default async function uri2url(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const protocol = this.getParam('protocol', 'http:');
    const host = this.getParam('host', `${hostname()}:${ezs.settings.port}`);
    if (!isURI(data)) {
        return feed.end();
    }
    return feed.send(`${protocol}//${host}/${data}`);
}

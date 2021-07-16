import { URL } from 'url';

function URLParse(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const u = new URL(data);
    return feed.send({
        href: u.href,
        origin: u.origin,
        protocol: u.protocol,
        username: u.username,
        password: u.password,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        search: u.search,
        hash: u.hash,
    });
}

/**
 * Take an URL `String`, parse it and return `Object`.
 *
 * Fields of the returned object:
 *
 * - href
 * - origin
 * - protocol
 * - username
 * - password
 * - host
 * - hostname
 * - port
 * - pathname
 * - search
 * - hash
 *
 * URLString statement convert such an object to a string.
 *
 * @name URLParse
 * @returns {Object}
 * @see URLString
 * @see https://nodejs.org/api/url.html
 */
export default {
    URLParse,
};

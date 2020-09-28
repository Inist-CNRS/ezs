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
 * Take `String` of URL, parse it and returns `Object`
 *
 * @name URLParse
 * @returns {Object}
 */
export default {
    URLParse,
};

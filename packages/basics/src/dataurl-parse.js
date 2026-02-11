import { URL } from 'url';


/**
 * Take an URL `String`, parse it as a data URLs, return `Object`.
 *
 * See:
 *
 * - {@link https://developer.mozilla.org/fr/docs/Web/URI/Reference/Schemes/data}
 *
 * @name DataURLParse
 * @returns {Object}
 */
export default function DataURLParse(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const parts = String(data).split(',');

    if (parts.length < 2) {
        return feed.send(new Error('Invalid Data URL'));
    }
    return feed.send(Buffer.from(parts[1], 'base64'));
}

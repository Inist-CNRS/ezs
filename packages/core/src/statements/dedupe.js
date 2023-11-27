import _ from 'lodash';
/**
 * Take `Object`, and check that the object identifier has not already been used previously
 *
 * @param {String} [path = uri] path containing the object Identifier
 * @param {Boolean} [ignore = false] Just ignore duplicate object
 * @returns {Object}
 */
export default async function identify(data, feed) {
    const pathName = this.getParam('path', 'uri');
    const ignore = Boolean(this.getParam('ignore', false));
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const check = 'no uri!';
    const uri = _.get(data, path, check);
    if (!this.previousURI) {
        this.previousURI = {};
    }
    if (this.isLast()) {
        return feed.close();
    }
    if (uri === check) {
        if (ignore) {
            console.warn(`WARNING: ${path} field not exists, item #${this.getIndex()} was ignored` );
            return feed.end();
        }
        return feed.send(new Error(`${path} field not exists, enable to dedupe.`));
    }
    if (this.previousURI[uri] === true) {
        if (ignore) {
            console.warn(`WARNING: ${uri} already exists, item #${this.getIndex()} was ignored` );
            return feed.end();
        }
        return feed.send(new Error(`Duplicate identifier: ${uri} already exists`));
    }
    this.previousURI[uri] = true;
    return feed.send(data);
}

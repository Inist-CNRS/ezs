import {
    assocPath, curry, map, path, pipe, toLower,
} from 'ramda';

const objPropLower = curry((propPath, obj) => {
    /**
     * @type {function(object): string}
     * @private
     */
    const propToLowerCase = pipe(
        path(propPath),
        toLower,
    );
    const str = propToLowerCase(obj);
    const res = assocPath(propPath, str, obj);
    return res;
});

/**
 * Transform strings to lower case.
 *
 * @export
 * @name TeeftToLowerCase
 * @param {Array<string>}   [path=[]]    path to the property to modify
 */
export default function TeeftToLowerCase(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const paramPath = this.getParam('path', []);
    const arrayPath = Array.isArray(paramPath) ? paramPath : [paramPath];
    let res;
    if (Array.isArray(data)) {
        res = map(objPropLower(arrayPath), data);
    } else {
        res = objPropLower(arrayPath, data);
    }
    feed.write(res);
    feed.end();
}

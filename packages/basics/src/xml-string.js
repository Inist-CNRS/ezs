import XML from 'xml-mapping';

function XMLString(data, feed) {
    const rootElement = this.getParam('rootElement', 'items');
    const contentElement = this.getParam('contentElement', 'item');
    if (this.isLast()) {
        const endTag = rootElement.length > 0 ? `</${rootElement}>` : '';
        if (endTag) feed.write(endTag);
        return feed.close();
    }
    if (this.isFirst()) {
        const prologue = this.getParam('prologue', false)
            ? '<?xml version="1.0" encoding="UTF-8"?>\n'
            : '';
        const rootNamespace = []
            .concat(this.getParam('rootNamespace'))
            .filter(Boolean)
            .map((ns) => ns.replace('://', '§§§'))
            .map((ns) => ns.split(':'))
            .map((ns) => (ns[1] ? [`:${ns[0]}`, ns[1]] : ['', ns[0]]))
            .map((ns) => [ns[0], ns[1].replace('§§§', '://').trim()])
            .reduce(
                (prev, cur) => `${prev} xmlns${cur[0]}="${encodeURI(cur[1])}"`,
                '',
            );
        const beginTag =
            rootElement.length > 0
                ? `${prologue}<${rootElement}${rootNamespace}>`
                : '';
        if (beginTag) {
            feed.write(beginTag);
        }
    }
    feed.send(XML.dump({ [contentElement]: data }));
}

/**
 * Transform an `Object` into an XML string.
 *
 * Input:
 *
 * ```json
 * [{ "$t": "a" }]
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   "<items><item>a</item></items>"
 * ]
 * ```
 *
 * See {@link XMLParse}
 * @name XMLString
 * @param {String} [rootElement="items"] Root element name for the tag which starts and close the feed
 * @param {String} [contentElement="item"] Content element name for the tag which starts and closes each item
 * @param {String} [rootNamespace] Namespace for the root tag (xmlns=)
 * @param {Boolean} [prologue=false] Add XML prologue `<?xml`
 * @returns {String}
 */
export default {
    XMLString,
};

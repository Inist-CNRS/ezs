import XML from 'xml-mapping'

function XMLString(data, feed) {
    const rootElement = this.getParam('rootElement', 'items');
    const contentElement = this.getParam('contentElement', 'item');
    const beginTag = rootElement ? `<${rootElement}>` : '';
    const endTag = rootElement ? `</${rootElement}>` : '';

    if (this.isLast()) {
        if (endTag) feed.write(endTag);
        return feed.close();
    }
    if (this.isFirst() && beginTag) {
        feed.write(beginTag);
    }
    feed.send(XML.dump({ [contentElement]: data }));
}

/**
 * Take `Object` and transform it into a XML string
 *
 * @name XMLString
 * @param {String} [rootElement=items] Root element name for the tag which start and close the feed
 * @param {String} [contentElement=item] Content element name for the tag which start and close each item
 * @returns {String}
 */
export default {
    XMLString,
};

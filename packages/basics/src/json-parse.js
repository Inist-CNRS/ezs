import JSONStream from 'JSONStream';

function JSONParse(data, feed) {
    const { ezs } = this;
    if (!this.handle) {
        const separator = this.getParam('separator', '*');
        this.handle = JSONStream.parse(separator);
        this.handle.on('data', (obj) => feed.write(obj));
    }
    if (!this.isLast()) {
        ezs.writeTo(this.handle,
            data,
            () => feed.end());
    } else {
        this.handle.end();
        process.nextTick(() => {
            feed.close();
        });
    }
}

/**
 * Take `String` and parse JSON and generate objects
 *
 * @name JSONParse
 * @param {String} [separator=*] to split at every JSONPath found
 * @returns {Object}
 * @see https://github.com/dominictarr/JSONStream
 */
export default {
    JSONParse,
};

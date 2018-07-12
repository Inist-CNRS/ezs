import lda from 'lda';
import get from 'lodash.get';
/**
 * Take `Object` and take values with [value] path (must be an array)
 *
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function topics(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const topics = this.getParam('topics', 2);
    const terms = this.getParam('terms', 5);
    const language = this.getParam('language', 'en');
    const seed = this.getParam('seed', 123);
    const languages = Array.isArray(language) ? language : [language];

    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        const result = lda(values, topics, terms, languages, seed);
        result.forEach((topic, topicIndex) => {
            topic.forEach((term) => {
                feed.write({ ...term, topic: (topicIndex + 1), id: data.id });
            });
        });
    }

    feed.end();
}


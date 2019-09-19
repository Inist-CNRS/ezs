import from from 'from';
import delegate from './delegate';

/**
 * Measure the execution time of a script, on each chunk on input.
 *
 * @example <caption>Input</caption>
 * [1]
 *
 * @example <caption>Program</caption>
 * const script = `
 * [transit]
 * `;
 * from([1])
 *     .pipe(ezs('time', { script }))
 *
 * @example <caption>Output</caption>
 * [{
 *   data: 1,
 *   time: 15 // milliseconds
 * }]
 * @name time
 * @param {string}  [script]
 * @return {object}
 */
// eslint-disable-next-line consistent-return
export default function time(data, feed) {
    const { ezs } = this;
    const script = this.getParam('script');
    if (this.isLast()) {
        return feed.close();
    }
    if (script) {
        const startTime = Date.now();
        from([data])
            .pipe(ezs(delegate, { script }))
            .on('end', () => {
                const duration = Date.now() - startTime;
                feed.write({ data, time: duration });
                return feed.end();
            });
    } else {
        feed.write({ data, time: 0 });
        return feed.end();
    }
}

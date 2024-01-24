import from from 'from';

/**
 * Helper function use to call ezs in each tests
 * @param ezsRuntime {(name: string, options: any, environment?: unknown) => NodeJS.WritableStream}
 * @param dataSet {Array<unknown>}
 * @param functionName {string}
 * @param [options] {any}
 * @returns {Promise<Array<unknown>>}
 */
const runEzs = (ezsRuntime, dataSet, functionName, options) => new Promise((resolve) => {
    const result = [];
    from(dataSet)
        .pipe(ezsRuntime(functionName, options))
        .on('data', (chunk) => {
            result.push(chunk);
        })
        .on('end', () => {
            resolve(result);
        });
});

export default runEzs;
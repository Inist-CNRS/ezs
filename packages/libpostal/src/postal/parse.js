import postal from 'node-postal';

/**
 * Perform libpostal parse address
 * @param input{string} Address to expand
 * @param path{string} Path of the parsed address in the result object
 * @return {{[path: string]: string[], id: string}}
 */
const parse = (input, path = 'value') => ({
    id: input,
    [path]: postal.parser
        .parse_address(String(input).trim())
        .reduce((outputResult, postalResult) => ({
            ...outputResult,
            [postalResult.component]: postalResult.value
        }), {}),
});

export default parse;
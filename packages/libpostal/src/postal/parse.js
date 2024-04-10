import postal from 'node-postal';

/**
 * Perform libpostal parse address
 * @private
 * @param input{string} Address to expand
 * @return {{value: object, id: string}}
 */
const parse = (input) => ({
    id: input,
    value: postal.parser
        .parse_address(String(input).trim())
        .reduce((outputResult, postalResult) => ({
            ...outputResult,
            [postalResult.component]: postalResult.value
        }), {}),
});

export default parse;
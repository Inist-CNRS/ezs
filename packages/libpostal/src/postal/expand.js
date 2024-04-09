import postal from 'node-postal';

/**
 * Perform libpostal expand address
 * @private
 * @param input{string} Address to expand
 * @param path{string} Path of the expanded address in the result object
 * @return {{[path: string]: string[], id: string}}
 */
const expand = (input, path = 'value') => ({
    id: input,
    [path]: postal.expand.expand_address(String(input).trim()),
});

export default expand;
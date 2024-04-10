import postal from 'node-postal';

/**
 * Perform libpostal expand address
 * @private
 * @param input{string} Address to expand
 * @return {{value: string[], id: string}}
 */
const expand = (input) => ({
    id: input,
    value: postal.expand.expand_address(String(input).trim()),
});

export default expand;
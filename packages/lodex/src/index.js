import flattenPatch from './flatten-patch';
import objects2columns from './objects2columns';

export default {
    flattenPatch,
    objects2columns,
    // aliases
    fixFlatten: flattenPatch.flattenPatch,
};

/**
 * Check whether the lowercase of `haystack` includes the lowercase of `needle`.
 * @param {string} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export const includesLowerCase = (haystack, needle) => {
    return haystack.toLowerCase().includes(needle.toLowerCase());
};

/**
 * Check whether the `haystack` array lowercase elements includes the lowercase of `needle`.
 * @param {string[]} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export const includesLowerCaseArray = (haystack, needle) => {
    const lowerCaseNeedle = needle.toLowerCase();
    return haystack
        .map((e) => e.toLowerCase())
        .includes(lowerCaseNeedle);
};

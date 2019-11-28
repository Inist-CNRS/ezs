import unidecode from 'unidecode';
import { compose, replace, toLower } from 'ramda';

export const removeAccents = (str) => unidecode(str);
export const removeDash = replace(/-/g, ' ');
export const removeQuote = replace(/'/g, ' ');
/**
 * Deplete string from accents and upper case.
 * @param {string} str
 * @returns {string}
 * @private
 */
export const depleteString = compose(toLower, removeAccents, removeQuote, removeDash, String);

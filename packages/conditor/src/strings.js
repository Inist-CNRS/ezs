import unidecode from 'unidecode';
import { compose, replace, toLower } from 'ramda';

export const removeAccents = (str) => unidecode(str);
export const removeDash = replace('-', ' ');
export const removeQuote = replace("'", ' ');
/**
 * Deplete string from accents and upper case.
 * @param {string} str
 * @returns {string}
 * @private
 */
export const depleteString = compose(toLower, removeAccents, removeQuote, removeDash, String);

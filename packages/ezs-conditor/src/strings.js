import unidecode from 'unidecode';
import { compose, toLower } from 'ramda';

export const removeAccents = (str) => unidecode(str);
/**
 * Deplete string from accents and upper case.
 * @param {string} str
 * @returns {string}
 */
export const depleteString = compose(toLower, removeAccents, String);

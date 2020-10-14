import { any, pipe, slice } from 'ramda';
import { isIn } from './rnsr';
import { depleteString } from './strings';

/** @type {import('./rnsr').RepNatStrRech} RNSR */
import RNSR from '../data/RNSR.json';

/**
 * @typedef {Object<string, any>} Affiliation
 * @property {string} ref
 * @property {string} address
 * @property {string[]} isni
 * @property {string[]} idRef
 * @property {string[]} rnsr
 * @private
 */

/**
 * @typedef {Object<string, any>} Author
 * @property {Affiliation[]} affiliations
 * @private
 */

/**
 * @typedef {Object<string, any>} Notice
 * @property {Author[]} authors
 * @property {string[]} rnsr
 * @private
 */

const isValidYear = (min, max) => (year) => {
    if (min > year) return false;
    if (max && max < year) return false;
    return true;
};

const existedInYears = (years) => (structure) => {
    if (years.length === 0) return true;
    const createdAt = Number(structure.annee_creation);
    const closedAt = structure.an_fermeture && Number(structure.an_fermeture);
    return any(isValidYear(createdAt, closedAt), years);
};

const addRnsrFromYearsInAffiliation = (years) => (affiliations, affiliation) => {
    const isInAddress = isIn(depleteString(affiliation.address), affiliation.rnsr);
    const conditorRnsr = RNSR.structures.structure
        .filter(existedInYears(years))
        .filter(isInAddress)
        .map((s) => s.num_nat_struct);
    const affiliationRnsr = { ...affiliation, conditorRnsr };
    return [...affiliations, affiliationRnsr];
};

const addRnsrFromYearsInAuthor = (years) => (authors, author) => {
    const affiliationsRnsr = author.affiliations.reduce(addRnsrFromYearsInAffiliation(years), []);
    const authorRnsr = { ...author, affiliations: affiliationsRnsr };
    return [...authors, authorRnsr];
};

/**
 * Get the year part of a string
 *
 * @example
 * getYear("2016-06-23"); // 2016
 *
 * @param {string} str
 * @returns {number}
 * @private
 */
const getYear = pipe(slice(0, 4), Number);

/**
 * Find the RNSR identifiers in the authors affiliation addresses.
 *
 * Input file:
 *
 * ```json
 * [{
 *      "xPublicationDate": ["2012-01-01", "2012-01-01"],
 *      "authors": [{
 *          "affiliations": [{
 *              "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009"
 *          }]
 *      }]
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = basics
 * plugin = conditor
 *
 * [JSONParse]
 * [affAlign]
 * [JSONString]
 * indent = true
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *      "xPublicationDate": ["2012-01-01", "2012-01-01"],
 *      "authors": [{
 *          "affiliations": [{
 *              "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
 *              "conditorRnsr": ["200619958X"]
 *          }]
 *      }]
 * }]
 * ```
 *
 * @export
 * @name affAlign
 */
export default async function affAlign(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (typeof data !== 'object') {
        return feed.send(new Error('affAlign: notice should be an object'));
    }
    if (!data.authors) {
        return feed.send(new Error('affAlign: notice should have authors'));
    }
    const xPublicationDate = data.xPublicationDate || [];
    /** @type number[] */
    const xPublicationYears = xPublicationDate.map(getYear);
    const authors = data.authors.reduce(addRnsrFromYearsInAuthor(xPublicationYears), []);
    const notice = { ...data, authors };
    feed.write(notice);
    return feed.end();
}

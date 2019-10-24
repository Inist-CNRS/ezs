import { isIn, getRNSR } from './rnsr';

/** @type {import('./rnsr').RepNatStrRech} RNSR */
let RNSR;

/**
 * @typedef {Object<string, any>} Affiliation
 * @property {string} ref
 * @property {string} address
 * @property {string[]} isni
 * @property {string[]} idRef
 * @property {string[]} rnsr
 */

/**
 * @typedef {Object<string, any>} Author
 * @property {Affiliation[]} affiliations
 */

/**
 * @typedef {Object<string, any>} Notice
 * @property {Author[]} authors
 * @property {string[]} rnsr
 */

/**
 * Add `conditorRnsr` in `affiliation`, and add `affiliation` to `affiliations`.
 *
 * @param {Affiliation[]} affiliations
 * @param {Affiliation} affiliation
 * @returns {Affiliation[]}
 */
const addRnsrInAffiliation = (affiliations, affiliation) => {
    const isInAddress = isIn(affiliation.address);
    const conditorRnsr = RNSR.structures.structure
        .filter(isInAddress)
        .map((s) => s.num_nat_struct);
    const affiliationRnsr = { ...affiliation, conditorRnsr };
    return [...affiliations, affiliationRnsr];
};

/**
 * Add `conditorRnsr` in `author`'s `affiliations`.
 *
 * @param {Author[]} authors
 * @param {Author} author
 * @return {Author[]}
 */
const addRnsrInAuthor = (authors, author) => {
    const affiliationsRnsr = author.affiliations.reduce(addRnsrInAffiliation, []);
    const authorRnsr = { ...author, affiliations: affiliationsRnsr };
    return [...authors, authorRnsr];
};

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
    if (!RNSR) {
        RNSR = await getRNSR();
    }
    const authors = data.authors.reduce(addRnsrInAuthor, []);
    const notice = { ...data, authors };
    feed.write(notice);
    return feed.end();
}

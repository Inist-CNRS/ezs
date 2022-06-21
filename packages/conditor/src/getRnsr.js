import { prop } from 'ramda';
import { existedInYear, getRnsrYear, isIn } from './rnsr';
import { depleteString } from './strings';

/**
 * Find the RNSR identifier(s) matching the `address` and the publication `year`
 * of an article.
 *
 * Get objects with an `id` field and a `value` field.
 *
 * The `value` field is an object containing `address` and `year`.
 *
 * Returns an object with `id` and `value` fields. The `value` is an array of
 * RNSR identifiers (if any).
 *
 * Input:
 *
 * ```json
 * [{
 *   "id": 1,
 *   "value": {
 *     "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
 *     "year": "2012"
 *   }
 * }]
 * ```
 *
 * Output:
 *
 * ```json
 * [{ "id": 1, "value": ["200619958X"] }]
 * ```
 *
 * @export
 * @param {number} [year=2021] Year of the RNSR to use instead of the last one
 * @name getRnsr
 */
export default async function getRnsr(data, feed) {
    if (this.isFirst()) {
        const rnsrYear = this.getParam('year', 2021);
        this.RNSR = await getRnsrYear(rnsrYear);
    }
    if (this.isLast()) {
        return feed.close();
    }
    if (typeof data !== 'object') {
        return feed.send(new Error('getRnsr: input should be an object'));
    }
    if (data.id === undefined) {
        return feed.send(new Error('getRnsr: input objects should contain an id field'));
    }
    if (data.value === undefined) {
        return feed.send(new Error('getRnsr: input objects should contain a value field'));
    }
    if (typeof data.value !== 'object') {
        return feed.send(new Error('getRnsr: input value should be an object'));
    }
    if (data.value.address === undefined) {
        return feed.send(new Error('getRnsr: input value objects should contain an address field'));
    }
    const { id, value } = data;
    const { address, year } = value;
    const isInAddress = isIn(depleteString(address));
    const rnsrIds = this.RNSR.structures.structure
        .filter(existedInYear(year))
        .filter(isInAddress)
        .map(prop('num_nat_struct'));
    feed.write({ id, value: rnsrIds });
    return feed.end();
}

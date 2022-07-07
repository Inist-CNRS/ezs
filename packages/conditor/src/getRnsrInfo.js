import { existedInYear, getRnsrYear, isIn } from './rnsr';
import { depleteString } from './strings';

/**
 * Find the RNSR information matching the `address` and the publication `year`
 * of an article.
 *
 * Get objects with an `id` field and a `value` field.
 *
 * The `value` field is an object containing `address` and `year`.
 *
 * Returns an object with `id` and `value` fields. The `value` is an array of
 * RNSR information objects (if any).
 *
 * Input:
 *
 * ```json
 * [{
 *   "id": 1,
 *   "value": {
 *     "address": "Laboratoire des Sciences du Climat et de l'Environnement (LSCE), IPSL, CEA/CNRS/UVSQ Gif sur Yvette France",
 *     "year": "2019"
 *   }
 * }]
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *     "an_fermeture": "",
 *     "annee_creation": "2014",
 *     "code_postal": "75015",
 *     "etabAssoc": [{
 *         "etab": {
 *             "libelle": "Centre national de la recherche scientifique",
 *             "libelleAppauvri": "centre national de la recherche scientifique",
 *             "sigle": "CNRS",
 *             "sigleAppauvri": "cnrs"
 *         },
 *         "label": "UMR",
 *         "labelAppauvri": "umr",
 *         "numero": "8253"
 *     }, {
 *         "etab": {
 *             "libelle": "Institut national de la sante et de la recherche medicale",
 *             "libelleAppauvri": "institut national de la sante et de la recherche medicale",
 *             "sigle": "INSERM",
 *             "sigleAppauvri": "inserm"
 *         },
 *         "label": "U",
 *         "labelAppauvri": "u",
 *         "numero": "1151"
 *     }, {
 *         "etab": {
 *             "libelle": "Université Paris Cité",
 *             "libelleAppauvri": "universite paris cite",
 *             "sigle": "U PARIS Cité",
 *             "sigleAppauvri": "u paris cite"
 *         },
 *         "label": "UM",
 *         "labelAppauvri": "um",
 *         "numero": "111"
 *     }],
 *     "intitule": "Institut Necker Enfants Malades - Centre de médecine moléculaire",
 *     "intituleAppauvri": "institut necker enfants malades   centre de medecine moleculaire",
 *     "num_nat_struct": "201420755D",
 *     "sigle": "INEM",
 *     "sigleAppauvri": "inem",
 *     "ville_postale": "PARIS",
 *     "ville_postale_appauvrie": "paris"
 * }]
 * ```
 *
 * @export
 * @param {number} [year=2021] Year of the RNSR to use instead of the last one
 * @name getRnsrInfo
 */
export default async function getRnsrInfo(data, feed) {
    if (this.isFirst()) {
        const rnsrYear = this.getParam('year', 2021);
        this.RNSR = await getRnsrYear(rnsrYear);
    }
    if (this.isLast()) {
        return feed.close();
    }
    if (typeof data !== 'object') {
        return feed.send(new Error('getRnsrInfo: input should be an object'));
    }
    if (data.id === undefined) {
        return feed.send(new Error('getRnsrInfo: input objects should contain an id field'));
    }
    if (data.value === undefined) {
        return feed.send(new Error('getRnsrInfo: input objects should contain a value field'));
    }
    if (typeof data.value !== 'object') {
        return feed.send(new Error('getRnsrInfo: input value should be an object'));
    }
    if (data.value.address === undefined) {
        return feed.send(new Error('getRnsrInfo: input value objects should contain an address field'));
    }
    const { id, value } = data;
    const { address, year } = value;
    const isInAddress = isIn(depleteString(address));
    const rnsrInfos = this.RNSR.structures.structure
        .filter(existedInYear(year))
        .filter(isInAddress);
    feed.write({ id, value: rnsrInfos });
    return feed.end();
}

/**
 * Take Conditor JSON documents and compute the recall of
 * `authors.affiliations.conditorRnsr` in relation to
 * `authors.affiliations.rnsr`.
 *
 * @example <caption>Input</caption>
 * [{
 *      "authors": [{
 *          "affiliations": [{
 *              "address": "GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009",
 *              "rnsr": ["200619958X"],
 *              "conditorRnsr": ["200619958X"]
 *          }]
 *      }]
 * }]
 *
 * @example <caption>Output</caption>
 * {
 *      "correct": 1,
 *      "total": 1,
 *      "recall": 1
 * }
 *
 * @export
 * @name compareRnsr
 */
export default function compareRnsr(data, feed) {
    if (this.isLast()) {
        this.stats.recall = this.stats.correct / this.stats.total;
        feed.write(this.stats);
        return feed.close();
    }
    if (this.isFirst()) {
        this.stats = {
            correct: 0,
            total: 0,
        };
    }

    this.stats = data.authors.reduce(
        (authStats, author) => author.affiliations.reduce(
            (stats, affiliation) => ({
                correct: affiliation.rnsr.reduce(
                    (correct, rnsr) => correct + (affiliation.conditorRnsr.includes(rnsr) ? 1 : 0),
                    stats.correct,
                ),
                total: stats.total + affiliation.rnsr.length,
            }),
            authStats,
        ),
        this.stats,
    );
    return feed.end();
}

/**
 * @export
 * @param {number} [year] Year of the RNSR to use instead of the last one
 * @name getRnsr
 */
export default async function getRnsr(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { id } = data;
    feed.write({ id, value: [] });
    return feed.end();
}

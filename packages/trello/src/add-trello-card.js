import Trello from 'trello';

/**
 * From a `Object` containing name and desc field, this statement create a new card in a Trello Board
 *
 * Example
 *
 * ```ini
 * [use]
 * plugin = basics
 * plugin = trello
 *
 * # Parse CSV input
 * [CSVParse]
 * separator = fix('\t')
 *
 * # Transform each line on a object
 * [replace]
 * path = name
 * value = get(0)
 *
 * path = desc
 * value = self().values().drop().compact().join('\n  - ')
 *
 * # Avoid Invalid Object 
 * [validate]
 * path = name
 * rule = required|string
 *
 * path = desc
 * rule = required|string
 *
 * # Connect to Trello and add new card (fake key & token)
 * [addTrelloCard]
 * key = 14222d1e50d44686c8ce45354bc3bd
 * token = 9d6f64f0d37560e867639e1a23a27454cfb457cbf68dd7cdbcf156cbc87b38
 * boardID = 1dcd42f2e6d6aec5e5c5307
 *
 * # Converse only the name for output
 * [extract]
 * path = name
 *
 * # Output all new cards title
 * [CSVString]
 * header = false
 *
 * ```
 *
 * @name addTrelloCard
 * @param {String} [key] Trello API key
 * @param {String} [token] Trello API token
 * @param {String} [boardID] board ID
 * @returns {Object}
 */
export default function addTrelloCard(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const key = this.getParam('key');
    const token = this.getParam('token');
    const boardID = this.getParam('boardID');

    if (!boardID || !key || !token) {
        return feed.stop(new Error('Invalid parameter'));
    }

    if (!this.trello) {
        this.trello = new Trello(key, token);
    }
    this.trello.addCard(data.name, data.desc, boardID,
        (error, newCard) => {
            if (error) {
                return feed.stop(error);
            }
            return feed.send(newCard);
        });
}

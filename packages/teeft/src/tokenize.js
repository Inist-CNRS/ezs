import words from 'talisman/tokenizers/words';
import { map, replace } from 'ramda';

const hideDash = replace(/-/g, 'xyxyxyxyxyxy');
const revealDash = map(replace(/xyxyxyxyxyxy/g, '-'));

/**
 * Extract tokens from an array of documents (objects { path, sentences: [] }).
 *
 * Yields an array of documents (objects: { path, sentences: [[]] })
 *
 * > **Warning**: results are surprising on uppercase sentences,
 * > use TeeftToLowerCase
 *
 * @see http://yomguithereal.github.io/talisman/tokenizers/words
 * @export
 * @name TeeftTokenize
 */
export default function TeeftTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const docIn = data;

    const docsOut = {
        path: docIn.path,
        sentences: docIn.sentences
            .map(hideDash)
            .map(words)
            .map(revealDash),
    };
    feed.write(docsOut);
    feed.end();
}

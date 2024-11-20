import debug from 'debug';
import { StringDecoder } from 'string_decoder';


const eol = '\n';

/**
 * Take `String`s or `Buffer`s and throw `Object` builded by JSON.parse on each line.
 *
 * @name unpack
 * @returns {object}
 */
export default function unpack(data, feed) {
    if (!this.decoder) {
        this.decoder = new StringDecoder('utf8');
        this.remainder = '';
    }
    if (this.isLast()) {
        const lastchunk = [this.remainder, this.decoder.end()].filter(Boolean).join('');
        if (lastchunk) {
            feed.write(JSON.parse(lastchunk));
        }
        return feed.close();
    }

    let lines;
    if (Buffer.isBuffer(data)) {
        lines = this.decoder.write(data).split(eol);
    } else if (typeof data === 'string') {
        lines = data.split(eol);
    } else {
        lines = [];
    }
    if (this.remainder) {
        lines.unshift(this.remainder + lines.shift());
    }
    this.remainder = lines.pop();
    lines.filter(Boolean).forEach((line) => {
        try {
            const lineParsed = JSON.parse(line);
            return feed.write(lineParsed);
        } catch(e) {
            debug('ezs:warn')(`[unpack] Syntax error at #${this.getIndex()+1} with <line>${line}</line>`);
            return feed.stop(e);
        }
    });
    return feed.end();
}

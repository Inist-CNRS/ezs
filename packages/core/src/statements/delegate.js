import { PassThrough } from 'stream';
import File from '../file';
import Commands from '../commands';
import { DEBUG } from '../constants';
import {
    writeTo,
} from '../client';
/**
 * Takes an `Object` delegate processing to an external pipeline
 *
 * @param {String} [file] the external pipeline is descrbied in a file
 * @param {String} [script] the external pipeline is descrbied in a sting of characters
 * @param {String} [commands] the external pipeline is descrbied in object
 * @param {String} [method=pipeline] set method to `booster` to speed up the external pipeline.
 * @returns {Object}
 */
export default function delegate(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const file = this.getParam('file');
        const script = this.getParam('script', File(ezs, file));
        const cmds = new Commands(ezs.parseString(script));
        const commands = this.getParam('commands', cmds.get());
        const method = this.getParam('method', 'pipeline');
        const environment = this.getEnv();

        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for dispatch'));
        }

        const func = method === 'booster' ? method : 'pipeline';
        const handle = ezs[func](commands, environment)
            .on('error', e => feed.stop(e));
        this.input = new PassThrough({ objectMode: true });

        const output = this.input
            .pipe(handle)
            .pipe(ezs.catch(e => feed.write(e)))
            .on('error', e => feed.write(e))
            .on('data', d => feed.write(d));

        this.whenFinish = new Promise((resolve) => {
            output.on('end', resolve);
        });
    }
    if (this.isLast()) {
        this.whenFinish
            .then(() => feed.close())
            .catch(e => feed.stop(e));
        this.input.end();
    } else {
        DEBUG(`Delegate chunk #${this.getIndex()} containing ${Object.keys(data).length || 0} keys`);
        writeTo(this.input, data, () => feed.end());
    }
    return 1;
}

import debug from 'debug';
import pool from './pool';

/**
 * Send all received {Object} to a host command
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = spawn
 *
 * [exec]
 * command = ./my/script.py
 * args = -o
 * args = -x
 *
 * ```
 *
 * @name exec
 * @param {String} [command] host command
 * @param {String} [args] argument for command
 * @param {Number} [concurrency = auto] Number of processes to launch concurrency
 * @returns {Object}
 */
export default async function exec(data, feed) {
    const { ezs } = this;
    const command = []
        .concat(this.getParam('command'))
        .filter(Boolean)
        .shift();
    const args = []
        .concat(this.getParam('args'))
        .filter(Boolean);
    const concurrency = Number([]
        .concat(this.getParam('concurrency', ezs.settings.concurrency))
        .filter(Boolean)
        .shift());

    let handle;
    try {
        debug('ezs:info')(`Startup pool for ${command} with ${concurrency} process`);
        handle = await pool.startup(concurrency, command, args);
        if (!this.resource) {
            this.input = ezs.createStream(ezs.objectMode());
            this.resource = await handle.acquire();
            this.input.pipe(ezs('pack')).pipe(this.resource.stdin);
            const output = this.resource.stdout.pipe(ezs('unpack'));
            this.resource.once('error', (err) => feed.stop(err));
            this.resource.once('exit', (exitCode) => {
                if (exitCode !== 0) {
                    handle.destroy(this.resource);
                    return feed.stop(new Error(`${command} exit with code ${exitCode}`));
                }
                return output.end();
            });
            this.whenFinish = feed.flow(output);
        }
        if (this.isLast()) {
            this.whenFinish
                .then(() => {
                    handle.destroy(this.resource);
                    feed.close();
                })
                .catch((e) => feed.stop(e));
            return this.input.end();
        }
        return ezs.writeTo(this.input, data, () => feed.end());
    } catch (e) {
        /* istanbul ignore next */
        if (this.resource) { // node  version < 14
            handle.destroy(this.resource);
        }
        handle.close();
        return feed.stop(e);
    }
}

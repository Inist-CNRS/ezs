import merge from 'merge2';
import debug from 'debug';
import { inspectServers, connectServer } from '../client';

/**
 * Dispatch processing to an external pipeline on one or more servers.
 *
 * @name dispatch
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @returns {Object}
 */
export default function dispatch(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        this.lastIndex = 0;
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmd1 = ezs.compileScript(script).get();
        const command = this.getParam('command');
        const cmd2 = [].concat(command).map(ezs.parseCommand).filter(Boolean);
        const commands = this.getParam('commands', cmd1.concat(cmd2));
        const environment = this.getEnv();
        const servers = inspectServers(
            this.getParam('server', []),
            commands,
            environment,
        );

        if (
            !servers
            || servers.length === 0
            || !commands
            || commands.length === 0
        ) {
            return feed.stop(new Error('Invalid parmeter for [dispatch]'));
        }
        debug('ezs:debug')(`[dispatch] connect to #${servers.length} servers.`);
        const handles = servers.map(connectServer(ezs));
        this.ins = handles.map((h) => h[0]);
        this.outs = handles.map((h) => h[1]);
        const funnel = merge(this.outs, ezs.objectMode())
            .on('queueDrain', () => {
                funnel.destroy();
            })
            .on('error', (e) => feed.write(e))
            .on('data', (d) => feed.write(d));
        this.whenFinish = new Promise((resolve) => {
            funnel.on('close', resolve);
        });
    }
    if (this.isLast()) {
        this.whenFinish.then(() => feed.close()).catch((e) => feed.stop(e));
        this.ins.forEach((handle) => handle.end());
    } else {
        if (this.lastIndex >= this.ins.length) {
            this.lastIndex = 0;
        }
        const check = ezs.writeTo(this.ins[this.lastIndex], data, () => feed.end());
        if (!check) {
            this.lastIndex += 1;
        }
    }
    return 1;
}

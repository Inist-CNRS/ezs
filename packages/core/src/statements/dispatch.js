import merge from 'merge2';
import File from '../file';
import Commands from '../commands';
import { DEBUG } from '../constants';
import {
    inspectServers,
    connectServer,
    writeTo,
} from '../client';

export default function dispatch(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        this.lastIndex = 0;
        const file = this.getParam('file');
        const script = this.getParam('script', File(ezs, file));
        const cmds = new Commands(ezs.parseString(script));
        const commands = this.getParam('commands', cmds.get());
        const servers = inspectServers(this.getParam('server', []), commands, this.getEnv());

        if (!servers || servers.length === 0 || !commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for dispatch'));
        }
        const handles = servers.map(connectServer(ezs));
        this.ins = handles.map(h => h[0]);
        this.outs = handles.map(h => h[1]);
        const funnel = merge(this.outs, ezs.objectMode())
            .on('queueDrain', () => {
                funnel.destroy();
            })
            .on('error', e => feed.write(e))
            .on('data', d => feed.write(d));
        this.whenFinish = new Promise((resolve) => {
            funnel.on('close', resolve);
        });
    }
    if (this.isLast()) {
        this.whenFinish
            .then(() => feed.close())
            .catch(e => feed.stop(e));
        this.ins.forEach(handle => handle.end());
    } else {
        if (this.lastIndex >= this.ins.length) {
            this.lastIndex = 0;
        }
        DEBUG(`Write #${this.getIndex()} with ${data.length || 0} items into handle #${this.lastIndex}/${this.ins.length}`);
        const check = writeTo(this.ins[this.lastIndex], data, () => feed.end());
        if (!check) {
            this.lastIndex += 1;
        }
    }
    return 1;
}

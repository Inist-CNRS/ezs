import debug from 'debug';
import { addedDiff } from 'deep-object-diff';

export default function singleton(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        const { ezs } = this;
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmd1 = ezs.compileScript(script).get();
        const command = this.getParam('command');
        const cmd2 = [].concat(command).map(ezs.parseCommand).filter(Boolean);
        const commands = this.getParam('commands', cmd1.concat(cmd2));
        const environment = this.getEnv();
        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for [singleton]'));
        }
        debug('ezs')('[singleton] starting once with one object.');
        const savedData = { ...data };
        let result = {};
        const input = ezs.createStream(ezs.objectMode());
        const streams = ezs.compileCommands(commands, environment);
        ezs.createPipeline(input, streams)
            .pipe(ezs.catch())
            .on('error', (e) => feed.stop(e))
            .on('data', (chunk) => {
                result = Object.assign(result, chunk);
            })
            .on('end', () => {
                this.addedResult = addedDiff(savedData, result);
                feed.send(Object.assign(data, this.addedResult));
            });
        input.write(data);
        return input.end();
    }
    return feed.send(Object.assign(data, this.addedResult));
}

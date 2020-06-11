import debug from 'debug';
import { addedDiff } from 'deep-object-diff';

export default function singleton(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        const { ezs } = this;
        debug('ezs')('[singleton] starting once with one object.');
        const savedData = { ...data };
        let result = {};
        const input = ezs.createStream(ezs.objectMode());
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        }, this.getEnv());
        ezs.createPipeline(input, commands)
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

import debug from 'debug';
import clone from 'lodash/clone.js'
import set from 'lodash/set.js';

import breaker from './breaker.js';
import {
    createFusible,
    enableFusible,
    disableFusible
} from '../fusible.js';



/**
 * fork the current pipeline
 *
 * > **Note**: but each chunk is sent to the same external pipeline.
 *
 * @name fork
 * @param {Boolean} [standalone=false] The current pipeline will be able to end without waiting for the end of the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @param {String} [target=x-request-id] choose the key to set with the forked request identifier
 * @returns {Object}
 */
export default async function fork(data, feed) {
    const { ezs } = this;
    const standalone = Number([]
        .concat(this.getParam('standalone', false))
        .filter(Boolean)
        .shift());
    const target = []
        .concat(this.getParam('target', 'x-request-id'))
        .filter(Boolean)
        .shift();

    if (this.isFirst()) {
        let output;
        try {
            this.fusible = await createFusible();
            await enableFusible(this.fusible);
            this.input = ezs.createStream(ezs.objectMode());
            const commands = ezs.createCommands({
                file: this.getParam('file'),
                script: this.getParam('script'),
                command: this.getParam('command'),
                commands: this.getParam('commands'),
                prepend: this.getParam('prepend'),
                append: this.getParam('append'),
            });
            const statements = ezs.compileCommands(commands, this.getEnv());
            statements.unshift(ezs(breaker, { fusible: this.fusible }));
            statements.push(ezs(breaker, { fusible: this.fusible }));
            const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
            output = ezs.createPipeline(this.input, statements, logger);
        }
        catch(e) {
            return feed.stop(e);
        }
        if (standalone) {
            output
                .on('data', () => true)
                .once('error', async () => {
                    await disableFusible(this.fusible);
                })
                .once('end', async () => {
                    await disableFusible(this.fusible);
                });
        } else {
            this.whenFinish = new Promise((resolve) => output
                .pipe(ezs.catch((e) => feed.write(e))) // avoid to break pipeline at each error
                .once('error', async (e) => {
                    await disableFusible(this.fusible);
                    feed.stop(e);
                })
                .on('data', () => true)
                .once('end', async () => {
                    await disableFusible(this.fusible);
                    resolve();
                })
            );
        }
    }
    if (this.isLast()) {
        debug('ezs:debug')(`${this.getIndex()} chunks have been delegated`);
        this.input.end();
        if (standalone) {
            feed.close();
        } else {
            this.whenFinish.finally(() => feed.close());
        }
        return true;
    }
    return ezs.writeTo(this.input, clone(data), () => {
        if (target) {
            set(data, target, this.fusible);
        }
        feed.send(data);
    });
}

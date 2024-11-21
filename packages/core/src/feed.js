import once from 'once';
import debug from 'debug';
import retimer from 'retimer';

export default class Feed {
    constructor(ezs, push, done, error, wait) {
        this.ezs = ezs;
        this.push = push;
        this.done = once(done);
        this.error = once(error);
        this.seal = once(() => {
            // ensure that all current writing operations are completed
            setImmediate(() => {
                push(null);
                done();
            });
        });
        this.wait = wait;
        this.timeout = Number(this.ezs.settings.feed.timeout);
    }

    write(something) {
        if (something === null) {
            this.seal();
        } else if (something !== undefined) {
            if (something instanceof Error) {
                something.type = 'Data corruption error';
                something.scope = 'data';
                something.date = new Date();
            }
            this.push(something);
        }
    }

    flow(stream, options = {}) {
        const { autoclose = false } = options;
        let closed = false;
        let autoCloseWanted = false;
        if (this.timeout > 0) {
            this.timer = retimer(() => {
                this.stop(new Error(`The pipe has not received any data for ${this.timeout} milliseconds.`));
                return stream.end();
            }, this.timeout);
        }

        stream.on('finish', () => {
            closed = true;
        this.log(`Feed.flow.stream.finish ${stream.isPaused()}`);
            if (autoclose) {
                if (stream.isPaused()) {
                    autoCloseWanted = true;
                } else {
                    this.close();
                }
            }
        });

        stream.on('data', async (data) => {
            if (this.timer) {
                this.timer.reschedule(this.timeout);
            }
            if (!this.push(data)) {
                this.log(`Feed.flow.stream.pause with ${data} and ${closed}/${autoCloseWanted}`);
                stream.pause();
                await this.wait();
                this.log(`Feed.flow.stream.resumewith ${data} and ${closed}/${autoCloseWanted}`);
                stream.resume();
                if (autoCloseWanted) {
                    this.close()
                }
            }
        });
        stream.once('error', (e) => {
            if (this.timer) {
                this.timer.clear();
            }
            return this.stop(e);
        });
        stream.once('end', () => {
            this.log('Feed.flow.stream.end');
            if (this.timer) {
                this.timer.clear();
            }
            return this.end();
        });
        return new Promise((resolve) => { this.log('Feed.flow.stream.end'); stream.once('end', resolve);});
    }
    log(x) {
        debug('ezs:debug')(this.engine.funcName, x);
    }

    end() {
        this.done();
    }

    send(something) {
        this.write(something);
        this.end();
    }

    close() {
        this.seal();
    }

    stop(withError) {
        withError.type = 'Fatal run-time error';
        withError.scope = 'statements';
        withError.date = new Date();
        this.error(withError);
        this.seal();
    }
}

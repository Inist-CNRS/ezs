import once from 'once';
import retimer from 'retimer';

export default class Feed {
    constructor(ezs, push, done, error, wait) {
        this.ezs = ezs;
        this.push = push;
        this.done = once(done);
        this.error = once(error);
        this.seal = once(() => { push(null); done(); });
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
        if (this.timeout > 0) {
            this.timer = retimer(() => {
                this.stop(new Error(`The pipe has not received any data for ${this.timeout} milliseconds.`));
                return stream.end();
            }, this.timeout);
        }

        stream.on('finish', () => {
            if (autoclose) {
                this.close();
            }
        });

        stream.on('data', async (data) => {
            if (this.timer) {
                this.timer.reschedule(this.timeout);
            }
            if (!this.push(data)) {
                stream.pause();
                await this.wait();
                stream.resume();
            }
        });
        stream.once('error', (e) => {
            if (this.timer) {
                this.timer.clear();
            }
            return this.stop(e);
        });
        stream.once('end', () => {
            if (this.timer) {
                this.timer.clear();
            }
            return this.end();
        });
        return new Promise((resolve) => stream.once('end', resolve));
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

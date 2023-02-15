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
    }

    write(something) {
        if (something === null) {
            this.seal();
        } else if (something !== undefined) {
            this.push(something);
        }
    }

    flow(stream, done) {
        const { timeout } = this.ezs.settings.feed;
        const timer = retimer(() => {
            this.stop(new Error(`The pipe has not received any data for ${timeout} milliseconds.`));
            return stream.end();
        }, timeout);

        stream.on('data', async (data) => {
            timer.reschedule(timeout);
            if (!this.push(data)) {
                stream.pause();
                await this.wait();
                stream.resume();
            }
        });
        stream.once('error', (e) => {
            timer.clear();
            if (done instanceof Function) {
                return done(e);
            }
            return this.stop(e);
        });
        stream.once('end', () => {
            timer.clear();
            if (done instanceof Function) {
                return done();
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
        this.error(withError);
        this.seal();
    }
}

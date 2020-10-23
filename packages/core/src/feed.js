import pWaitFor from 'p-wait-for';
import once from 'once';

export default class Feed {
    constructor(push, done, error, isReady) {
        this.push = push;
        this.done = once(done);
        this.error = once(error);
        this.seal = once(() => { push(null); done(); });
        this.isReady = isReady;
    }

    write(something) {
        if (something === null) {
            this.seal();
        } else if (something !== undefined) {
            this.push(something);
        }
    }

    flow(stream, done) {
        stream.on('data', async (data) => {
            if (!this.push(data)) {
                stream.pause();
                await pWaitFor(() => this.isReady());
                stream.resume();
            }
        });
        stream.once('error', (e) => {
            if (done instanceof Function) {
                return done(e);
            }
            return this.stop(e);
        });
        stream.on('end', () => {
            if (done instanceof Function) {
                return done();
            }
            return this.end();
        });
        return new Promise((resolve) => stream.on('end', resolve));
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

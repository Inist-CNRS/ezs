import pWaitFor from 'p-wait-for';

export default class Feed {
    constructor(push, done, error, isReady) {
        this.push = push;
        this.done = done;
        this.error = error;
        this.isReady = isReady;
    }

    write(something) {
        if (something === null) {
            this.close();
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
        stream.on('error', (e) => this.stop(e));
        stream.on('end', () => {
            if (done instanceof Function) {
                return done();
            }
            return this.end();
        });
    }

    end() {
        this.done();
    }

    send(something) {
        this.write(something);
        this.end();
    }

    close() {
        this.push(null);
        this.done();
    }

    stop(withError) {
        this.error(withError);
        this.close();
    }
}

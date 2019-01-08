export default class Feed {
    constructor(push, done, error) {
        this.push = push;
        this.done = done;
        this.error = error;
    }

    write(something) {
        if (something === null) {
            this.close();
        } else if (something !== undefined) {
            this.push(something);
        }
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

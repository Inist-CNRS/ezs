export default class Feed {
    constructor(push, done, stop) {
        this.push = push;
        this.done = done;
        this.stop = stop;
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
        this.stop(withError);
    }
}

export default class Feed {
    constructor(push, done) {
        this.push = push;
        this.done = done;
        this.bool = false;
    }
    write(something) {
        if (this.bool) {
            throw Error('You cannot call feed.write after feed.end');
        }
        if (something !== undefined) {
            this.push(something);
        }
    }
    end() {
        this.bool = true;
        this.done();
    }
    send(something) {
        this.write(something);
        this.end();
    }
    close() {
        this.write(null);
        this.end();
    }
}

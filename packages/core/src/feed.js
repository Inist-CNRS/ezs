export default class Feed {
    constructor(push, done) {
        this.push = push;
        this.done = done;
    }
    write(something) {
        if (something !== undefined) {
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
        this.write(null);
        this.end();
    }
}

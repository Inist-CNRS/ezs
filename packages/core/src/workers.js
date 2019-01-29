export default class Workers {
    constructor(workers) {
        this.handles = workers;
        this.lastIndex = -1;
    }

    choose() {
        this.lastIndex += 1;
        if (this.lastIndex >= this.handles.length) {
            this.lastIndex = 0;
        }
        return this.handles[this.lastIndex] ? this.handles[this.lastIndex] : null;
    }
}

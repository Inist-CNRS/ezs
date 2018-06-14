export default class Expression {
    constructor(value) {
        this.value = value;
    }
    get() {
        return this.value;
    }
    through(parser) {
        return parser(this.value);
    }
    toString() {
        return this.value;
    }
    toJSON() {
        return `Expression::${JSON.stringify(this.value)}`;
    }
}

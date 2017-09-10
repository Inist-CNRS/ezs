import _ from 'lodash';
import { Transform } from 'stream';
import Feed from './feed';
import Shell from './shell';

export default class Engine extends Transform {
    constructor(ezs, func, params, selector) {
        super({ objectMode: true });
        this.func = func;
        this.index = 0;
        this.selector = selector;
        this.params = params || {};
        this.scope = {};
        this.ezs = ezs;
    }

    _transform(chunk, encoding, done) {
        this.index += 1;
        if (chunk instanceof Error) {
            this.push(chunk);
            done();
        } else if (this.selector && _.has(chunk, this.selector)) {
            this.execWith(chunk, done);
        } else if (this.selector && !_.has(chunk, this.selector)) {
            this.push(chunk);
            done();
        } else {
            this.execWith(chunk, done);
        }
    }

    _flush(done) {
        this.execWith(null, done);
    }

    execWith(chunk, done) {
        const push = (data) => {
            if (data instanceof Error) {
                return this.pushError(data);
            }
            return this.push(data);
        };
        const feed = new Feed(push, done);
        this.scope.isFirst = () => (this.index === 1);
        this.scope.getIndex = () => this.index;
        this.scope.isLast = () => (chunk === null);
        this.scope.getParams = () => this.params;
        this.scope.ezs = this.ezs;

        try {
            const context = typeof chunk === 'object' ? { ...this.scope, ...chunk } : chunk;
            this.scope.getParam = (name, defval) =>
                (this.params[name] ? Shell(this.params[name], context) : defval);
            this.func.call(this.scope, chunk, feed);
        } catch (e) {
            this.pushError(e);
            done();
        }
    }

    pushError(e) {
        const msg = ' in item #'.concat(this.index);
        const stack = e.stack.split('\n').slice(0, 2);
        const err = new Error(stack[0].concat(msg).concat('\n').concat(stack[1]));
        if (process.env.NODE_ENV !== 'production') {
            console.error(err.message);
        }
        this.push(err);
    }

}

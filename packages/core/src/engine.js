import { Transform } from 'stream';
import Feed from './feed';
import Shell from './shell';

export default class Engine extends Transform {
    constructor(func, params, tagname) {
        super({ objectMode: true });
        this.func = func;
        this.index = 0;
        this.tagname = tagname;
        this.params = params || {};
        this.scope = {};
    }

    _transform(chunk, encoding, done) {
        this.index += 1;
        if (chunk instanceof Error) {
            this.push(chunk);
            done();
        } else if (this.tagname && chunk.tagName && this.tagname === chunk.tagName()) {
            this.execWith(chunk, done);
        } else if (this.tagname && chunk.tagName && this.tagname !== chunk.tagName()) {
            this.push(chunk);
            done();
        } else if (this.tagname && !chunk.tagName) {
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
            if (this.tagname && chunk && chunk.tagName) {
                data.tagName = chunk.tagName;
            }
            return this.push(data);
        };
        const feed = new Feed(push, done);
        this.scope.isFirst = () => (this.index === 1);
        this.scope.getIndex = () => this.index;
        this.scope.isLast = () => (chunk === null);
        this.scope.getParams = () => this.params;

        try {
            this.scope.getParam = (name, defval) =>
                (this.params[name] ? Shell(this.params[name], { ...this.scope, ...chunk }) : defval);
            this.func.call(this.scope, chunk, feed);
        } catch (e) {
            const err = this.createError(e);
            if (process.env.NODE_ENV !== 'production') {
                console.error(err.message);
            }
            this.push(err);
            done();
        }
    }

    createError(e) {
        const msg = ' in item #'.concat(this.index);
        const stack = e.stack.split('\n').slice(0, 2);
        const err = new Error(stack[0].concat(msg).concat('\n').concat(stack[1]));
        return err;
    }

}

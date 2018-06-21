import _ from 'lodash';
import { Transform } from 'stream';
import Parameter from './parameter';
import Feed from './feed';
import Shell from './shell';

function createErrorWith(error, index) {
    const stk = error.stack.split('\n');
    const erm = stk.shift();
    const msg = `Processing item #${index} failed with ${erm}\n\t${stk.slice(0, 10).join('\n\t')}`;
    const err = Error(msg);
    Error.captureStackTrace(err, createErrorWith);
    if (process.env.NODE_ENV !== 'production') {
        console.error('ezs caught an', err);
    }
    return err;
}

export default class Engine extends Transform {
    constructor(ezs, func, params, selector) {
        super({ objectMode: true });
        this.func = func;
        this.funcName = String(func.name);
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
                return this.push(createErrorWith(data, this.index));
            }
            return this.push(data);
        };
        const feed = new Feed(push, done);
        this.scope.isFirst = () => (this.index === 1);
        this.scope.getIndex = () => this.index;
        this.scope.isLast = () => (chunk === null);
        this.scope.ezs = this.ezs;

        try {
            this.scope.getParam = (name, defval) => {
                const globalParams = Parameter.get(this.ezs, this.funcName);
                if (this.params[name] !== undefined) {
                    return Shell(this.params[name], chunk);
                } else if (globalParams[name] !== undefined) {
                    return globalParams[name];
                }
                return defval;
            };
            this.func.call(this.scope, chunk, feed);
        } catch (e) {
            this.push(createErrorWith(e, this.index));
            done();
        }
    }
}

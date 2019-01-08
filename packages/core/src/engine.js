import Parameter from './parameter';
import Feed from './feed';
import Shell from './shell';
import { DEBUG } from './constants';
import SafeTransform from './SafeTransform';

function createErrorWith(error, index) {
    const stk = error.stack.split('\n');
    const erm = stk.shift();
    const msg = `Processing item #${index} failed with ${erm}\n\t${stk.slice(0, 10).join('\n\t')}`;
    const err = Error(msg);
    Error.captureStackTrace(err, createErrorWith);
    DEBUG('Caught an', err);
    return err;
}

export default class Engine extends SafeTransform {
    constructor(ezs, func, params, environment) {
        super(ezs.objectMode());
        this.func = func;
        this.funcName = String(func.name);
        this.index = 0;
        this.params = params || {};
        this.scope = {};
        this.ezs = ezs;
        this.environment = environment || {};
        this.nullWasSent = false;
    }

    _transform(chunk, encoding, done) {
        if (this.nullWasSent) {
            return done();
        }
        this.index += 1;
        if (chunk instanceof Error) {
            this.push(chunk);
            return done();
        }
        return this.execWith(chunk, done);
    }

    _flush(done) {
        this.execWith(null, done);
    }

    execWith(chunk, done) {
        const currentIndex = this.index;
        const warn = (error) => {
            this.emit('error', createErrorWith(error, currentIndex));
        };
        const push = (data) => {
            if (data instanceof Error) {
                return this.push(createErrorWith(data, currentIndex));
            }
            if (data === null) {
                this.nullWasSent = true;
            }
            return this.push(data);
        };
        const feed = new Feed(push, done, warn);
        try {
            this.scope.isFirst = () => (currentIndex === 1);
            this.scope.getIndex = () => currentIndex;
            this.scope.isLast = () => (chunk === null);
            this.scope.getEnv = name => (name === undefined ? this.environment : this.environment[name]);
            this.scope.ezs = this.ezs;
            this.scope.getParam = (name, defval) => {
                const globalParams = Parameter.get(this.ezs, this.funcName);
                if (this.params[name] !== undefined) {
                    return Shell(this.params[name], chunk, this.environment);
                } if (globalParams[name] !== undefined) {
                    return globalParams[name];
                }
                return defval;
            };
            Promise.resolve(this.func.call(this.scope, chunk, feed)).catch((e) => {
                warn(e);
                done();
            });
        } catch (e) {
            warn(e);
            done();
        }
    }
}

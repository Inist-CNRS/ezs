import debug from 'debug';
import Feed from './feed';
import Shell from './shell';
import queue from 'concurrent-queue';

import SafeTransform from './SafeTransform';

function createErrorWith(error = {}, index = 0, funcName = null) {
    const stk = String(error.stack).split('\n');
    const erm = stk.shift();
    const fn = funcName ? ` in [${funcName}]` : '';
    const msg = `(item #${index}${fn} failed with ${erm})\n\t${stk.slice(0, 10).join('\n\t')}`;
    const err = Error(msg);
    Error.captureStackTrace(err, createErrorWith);
    debug('ezs')('Caught an', err);
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
        this.queue = queue().limit(ezs.settings.queue).process((task, cb) => {
            this.execWith(task, cb);
        });
        this.on('pipe', (src) => {
            this.parentStream = src;
        });
    }

    _transform(chunk, encoding, done) {
        if (this.nullWasSent) {
            if (this.parentStream && this.parentStream.unpipe) {
                this.parentStream.unpipe(this);
            }
            return done();
        }
        this.index += 1;
        if (chunk instanceof Error) {
            this.push(chunk);
            return done();
        }
        return this.queue(chunk, done);
    }

    _flush(done) {
        if (this.nullWasSent) {
            return done();
        }
        this.index += 1;
        return this.queue(null, done);
    }

    execWith(chunk, done) {
        const currentIndex = this.index;
        if (chunk === null && currentIndex === 1) {
            this.nullWasSent = true;
            this.push(null);
            return done();
        }
        const warn = (error) => {
            this.emit('error', createErrorWith(error, currentIndex, this.funcName));
        };
        const push = (data) => {
            if (data instanceof Error) {
                debug('ezs')(`Ignoring error at item #${currentIndex}`);
                return this.push(createErrorWith(data, currentIndex, this.funcName));
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
            this.scope.emit = (d, c) => this.emit(d, c);
            this.scope.getParams = () => this.params;
            this.scope.getParam = (name, defval) => {
                if (this.params[name] !== undefined) {
                    return Shell(this.params[name], chunk, this.environment);
                }
                return defval;
            };
            Promise.resolve(this.func.call(this.scope, chunk, feed, currentIndex)).catch((e) => {
                debug('ezs')(`Async error thrown at item #${currentIndex}, pipeline is broken`);
                this.emit('error', createErrorWith(e, currentIndex, this.funcName));
                done();
            });
        } catch (e) {
            debug('ezs')(`Sync error thrown at item #${currentIndex}, pipeline carries errors`);
            this.push(createErrorWith(e, currentIndex, this.funcName));
            done();
        }
    }
}

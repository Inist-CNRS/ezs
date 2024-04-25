/* eslint no-underscore-dangle: ["error", { "allow": ["_readableState"] }] */
import debug from 'debug';
import queue from 'concurrent-queue';
import { hrtime } from 'process';
import eos from 'end-of-stream';
import pWaitFor from 'p-wait-for';
import Feed from './feed';
import Shell from './shell';

import SafeTransform from './SafeTransform';

/**
 * Engine scope object type
 * @private
 * @typedef {Object} EngineScope
 *
 * @property {Engine} ezs
 * @property {(d: unknown, c: unknown) => void} emit
 * @property {() => any} getParams
 * @property {() => boolean} isFirst
 * @property {() => number} getIndex
 * @property {() => boolean} isLast
 * @property {() => string} getCumulativeTime
 * @property {() => number} getCumulativeTimeMS
 * @property {() => number} getCounter
 * @property {(name: string, defval?: string | string[], chunk?: unknown) => string | string[] | undefined} getParam
 */

const nanoZero = () => BigInt(0);

const nano2sec = (ns) => {
    const sec = ns / BigInt(1e9);
    const msec = (ns / BigInt(1e6)) - (sec * BigInt(1e3));
    const time = Number(sec) + (Number(msec) / 10000);
    return Number(time).toFixed(4);
};
let counter = 0;
function increaseCounter() {
    counter += 1;
}
function decreaseCounter() {
    counter -= 1;
}

function createErrorWith(error, index, funcName, funcParams, chunk) {
    const stk = String(error.stack).split('\n');
    const prefix = `item #${index} `;
    const erm = stk.shift().replace(prefix, '');
    const msg = `${prefix}[${funcName}] <${erm}>\n\t${stk.slice(0, 10).join('\n\t')}`;
    const err = Error(msg);
    err.sourceError = error;
    err.sourceChunk = JSON.stringify(chunk);
    err.toJSON = () => ({
        type: error.type || 'Standard error',
        scope: error.scope || 'code',
        date: error.date || new Date(),
        message: msg.split('\n').shift(),
        func: funcName,
        params: funcParams,
        traceback: stk.slice(0,10),
        index,
        chunk,
    });
    Error.captureStackTrace(err, createErrorWith);
    debug('ezs')('Caught an', err);
    return err;
}

export default class Engine extends SafeTransform {
    constructor(ezs, func, params, environment) {
        super(ezs.objectMode());
        this.func = func;
        this.funcName = String(func.name || 'unamed');
        this.index = 0;
        this.ttime = nanoZero();
        this.stime = hrtime.bigint();
        this.params = params || {};
        this.ezs = ezs;
        this.environment = environment || {};
        this.errorWasSent = false;
        this.nullWasSent = false;
        this.queue = queue().limit(ezs.settings.queue).process((task, cb) => {
            this.execWith(task, cb);
        });
        this.on('pipe', (src) => {
            this.parentStream = src;
        });
        increaseCounter();
        eos(this, decreaseCounter);
        this.shell = new Shell(ezs, this.environment);
        this.chunk = {};
        /**
         * @private
         * @type {EngineScope}
         */
        this.scope = {};
        this.scope.getEnv = (name) => (name === undefined ? this.environment : this.environment[name]);
        this.scope.ezs = this.ezs;
        this.scope.emit = (d, c) => this.emit(d, c);
        this.scope.getParams = () => this.params;
        this.scope.isFirst = () => (this.index === 1);
        this.scope.getIndex = () => this.index;
        this.scope.isLast = () => (this.chunk === null);
        this.scope.getCumulativeTime = () => nano2sec(hrtime.bigint() - this.stime);
        this.scope.getCumulativeTimeMS = () => nano2sec(hrtime.bigint() - this.stime) * 1000;
        this.scope.getCounter = () => counter;
        this.scope.getParam = (name, defval, chunk) => {
            if (this.params[name] !== undefined) {
                return this.shell.run(this.params[name], chunk || this.chunk);
            }
            return defval;
        };
    }

    _transform(chunk, encoding, done) {
        const start = hrtime.bigint();
        const next = () => {
            if (debug.enabled('ezs')) {
                this.ttime += (hrtime.bigint() - start);
            }
            done();
        };
        if (this.nullWasSent) {
            if (this.parentStream && this.parentStream.unpipe) {
                this.parentStream.unpipe(this);
            }
            return next();
        }
        this.index += 1;
        if (chunk instanceof Error) {
            this.push(chunk);
            return next();
        }
        return this.queue(chunk, next);
    }

    _flush(done) {
        if (this.nullWasSent) {
            return done();
        }
        this.index += 1;
        return this.queue(null, () => {
            const stop = hrtime.bigint();
            if (debug.enabled('ezs')) {
                const cumulative = nano2sec(stop - this.stime);
                const elapsed = nano2sec(this.ttime);
                debug('ezs')(`${cumulative}s cumulative ${elapsed}s elapsed for [${this.funcName}]`);
            }
            done();
        });
    }

    isReady() {
        return ((!this._readableState.ended
            && (this._readableState.length < this._readableState.highWaterMark
                || this._readableState.length === 0))
            || this.nullWasSent);
    }

    execWith(chunk, done) {
        if (this.errorWasSent || this.nullWasSent) {
            return done();
        }
        const currentIndex = this.index;
        if (chunk === null && currentIndex === 1) {
            this.nullWasSent = true;
            this.push(null);
            return done();
        }
        const warn = (error) => {
            if (!this.errorWasSent) {
                this.errorWasSent = true;
                this.emit('error', createErrorWith(error, currentIndex, this.funcName, this.params, chunk));
            }
        };
        const push = (data) => {
            if (data === null) {
                this.nullWasSent = true;
                this.nullWasSentError = createErrorWith(new Error('As a reminder, the end was recorded at this point'), currentIndex, this.funcName, this.params, chunk);
            } else if (this.nullWasSent && !this.errorWasSent) {
                console.warn(createErrorWith(new Error('Oops, that\'s going to crash ?'), currentIndex, this.funcName, this.params, chunk));
                return warn(this.nullWasSentError);
            }
            if (!this.nullWasSent && this._readableState.ended) {
                return warn(new Error('No back pressure control ?'));
            }
            if (data instanceof Error) {
                debug('ezs')(`Ignoring error at item #${currentIndex}`);
                return this.push(createErrorWith(data, currentIndex, this.funcName, this.params, chunk));
            }
            if (!this.errorWasSent) {
                return this.push(data);
            }
        };
        const wait = async () => {
            this.pause();
            await pWaitFor(() => (this.isReady()), { interval: 20 });
            return this.resume();
        };
        const feed = new Feed(this.ezs, push, done, warn, wait);
        feed.engine = this;
        try {
            this.chunk = chunk;
            return Promise.resolve(this.func.call(this.scope, chunk, feed, this.scope)).catch((e) => {
                debug('ezs')(`Async error thrown at item #${currentIndex}, pipeline is broken`);
                this.emit('error', createErrorWith(e, currentIndex, this.funcName, this.params, chunk));
                done();
            });
        } catch (e) {
            debug('ezs')(`Sync error thrown at item #${currentIndex}, pipeline carries errors`);
            this.push(createErrorWith(e, currentIndex, this.funcName, this.params, chunk));
            return done();
        }
    }
}

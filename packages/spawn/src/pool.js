import { spawn } from 'child_process';
import { Pool } from 'sequelize-pool';

const config = {};
const handles = {};
const options = {};
const factory = (command, args, opts) => {
    const create = () => new Promise((resolve, reject) => {
        const onError = (e) => reject(e);
        const child = spawn(
            command,
            args,
            {
                ...config,
                stdio: ['pipe', 'pipe', process.stderr],
                detached: false,
            },
        );
        child.once('error', onError);
        child.on('spawn', () => {
            child.removeListener('error', onError);
            resolve(child);
        });
    });
    const validate = (resource) => Promise.resolve(!resource.killed);
    const destroy = (resource) => Promise.resolve(resource.kill());

    return {
        create,
        validate,
        destroy,
        ...opts,
    };
};

const opts = ({ settings }) => {
    const { concurrency } = settings;
    return {
        max: concurrency * 2,
        min: concurrency,
        idleTimeoutMillis: 1000, // * 30,
        acquireTimeoutMillis: 1000, // * 30,
    };
};

const uid = (...args) => args.map((x) => String(x)).join('');

const get = (ezs, command, args) => new Promise((resolve) => {
    const key = uid(command, args);
    if (!handles[key]) {
        options[key] = factory(command, args, opts(ezs));
        handles[key] = new Pool(options[key]);
    }
    return resolve(handles[key]);
});

const del = (ezs, command, args) => {
    const key = uid(command, args);
    if (!handles[key]) {
        return Promise.resolve();
    }
    return handles[key].destroyAllNow();
};

const shutdown = () => {
    const keys = Object.keys(handles);
    return Promise
        .all(keys.map((k) => handles[k].drain()))
        .then(() => Promise.all(keys.map((k) => {
            options[k].min = 0;
            return handles[k].destroyAllNow();
        }))).then(() => Promise.all(keys.map((k) => {
            delete options[k];
            return Promise.resolve(true);
        })));
};

const pool = {
    get,
    del,
    shutdown,
    config,
};

export default pool;

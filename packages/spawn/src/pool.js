import { spawn } from 'child_process';
import { satisfies } from 'semver';

class Pool {
    constructor(template) {
        this.template = template;
        this.size = Number(this.template.concurrency);
        this.queue = [];
        this.closed = false;
        this.promises = [];
    }

    fillup() {
        if (!this.closed) {
            Array(Number(this.size - this.queue.length))
                .fill(true)
                .map(() => this.template.create())
                .forEach((p) => {
                    this.queue.push(p);
                });
        }
    }

    async acquire() {
        if (this.queue.length === 0 && !this.closed) {
            this.fillup();
        }
        const promise = this.queue.shift();
        if (promise === undefined) {
            return Promise.reject(new Error('Broken pool ?'));
        }
        this.fillup();

        try {
            const resource = await promise;
            const ok = await this.template.validate(resource);
            if (ok) {
                return Promise.resolve(resource);
            }
            return Promise.reject(new Error('Invalid command !'));
        } catch (e) {
            return Promise.reject(e);
        }
    }

    destroy(resource) {
        return this.template.destroy(resource);
    }

    async close() {
        this.closed = true;
        const resources = [];
        while (this.queue.length > 0) {
            resources.push(this.queue.shift());
        }
        try {
            const values = await Promise.all(resources);
            await Promise.all(values.map((r) => this.destroy(r)));
            return Promise.resolve(true);
        } catch (e) {
            return Promise.resolve(false);
        }
    }
}

const config = {};
const handles = {};

// see https://github.com/sequelize/sequelize-pool/blob/master/docs/interfaces/FactoryOptions.md
const factory = (command, args, opts) => {
    const create = () => new Promise((resolve, reject) => {
        let spawned = false;
        const child = spawn(
            command,
            args,
            {
                ...config,
                stdio: ['pipe', 'pipe', process.stderr],
                detached: false,
            },
        );
        child.once('error', (e) => {
            if (!spawned) {
                return reject(e);
            }
            return true;
        });
        const ready = () => {
            spawned = true;
            resolve(child);
        };
        if (satisfies(process.versions.node, '>=14.0.0')) {
            child.on('spawn', ready);
        } else {
            process.nextTick(ready);
        }
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

const uid = (...args) => args.map((x) => String(x)).join('');

const startup = (concurrency, command, args) => new Promise((resolve) => {
    const key = uid(command, args);
    if (!handles[key]) {
        handles[key] = new Pool(factory(command, args, { concurrency }));
    }
    return resolve(handles[key]);
});

const shutdown = () => Promise.all(Object.keys(handles).map((k) => handles[k].close()));

const pool = {
    startup,
    shutdown,
    config,
};

export default pool;

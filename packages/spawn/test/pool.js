import pool from '../src/pool';

pool.config.cwd = __dirname;

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('pool', () => {
    afterAll(async () => {
        await pool.shutdown();
    });

    test('startup', async () => {
        const handle = await pool.startup(2, './cmd.py');
        await handle.close();
    });

    test('fill after close', async () => {
        const handle = await pool.startup(2, './cmd.py');
        await handle.close();
        handle.fillup();
    });

    test('acquire after close', async () => {
        const handle = await pool.startup(2, './cmd.py');
        await handle.close();
        try {
            await handle.acquire();
        } catch (e) {
            return Promise.resolve(true);
        }
        return Promise.reject(new Error('error is the expected behavior'));
    });

    test('break the pool', async () => {
        const handle = await pool.startup(1, './cmd.py');
        handle.queue[0] = undefined;
        try {
            await handle.acquire();
        } catch (e) {
            return Promise.resolve(true);
        }
        return Promise.reject(new Error('error is the expected behavior'));
    });

    test('break the command', async () => {
        const handle = await pool.startup(1, './cmd.py', [], { timeout: 1 });
        handle.fillup();
        await timeout(10);
        try {
            await handle.acquire();
        } catch (e) {
            return Promise.resolve(true);
        }
        return Promise.reject(new Error('error is the expected behavior'));
    });
});

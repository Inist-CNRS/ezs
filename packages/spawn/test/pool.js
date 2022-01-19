import pool from '../src/pool';

pool.config.cwd = __dirname;

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

    test.skip('acquire after close', async () => {
        const handle = await pool.startup(1, './cmd.py');
        console.log('PID', handle.queue[0].pid);
        try {
            const resource = await handle.acquire();
        } catch (e) {
            return Promise.resolve(true);
        }
        return Promise.reject(new Error('error is the expected behavior'));
    });

});

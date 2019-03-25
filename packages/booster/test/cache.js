import assert from 'assert';
import from from 'from';
import Cache from '../src/cache';

describe('test', () => {
    const handle = new Cache({
        cleanupDelay: 500,
        maxFiles: 3,
        maxTotalSize: 6,
    });

    describe('add keys', () => {
        before(() => handle.clear());
        it('and clean cache on demand', async () => {
            await handle.set('key#1', from(['a', 'b', 'c']));
            await handle.set('key#2', from(['a', 'b', 'c']));
            await handle.set('key#3', from(['a', 'b', 'c']));
            await handle.set('key#4', from(['a', 'b', 'c']));
            await handle.set('key#5', from(['a', 'b', 'c']));
            await handle.set('key#6', from(['a', 'b', 'c']));
            const entries1 = await handle.all();
            assert.equal(Object.keys(entries1).length, 6);
            await handle.clean();
            const entries2 = await handle.all();
            assert.equal(Object.keys(entries2).length, 2);
        });
    });

    describe('add keys', () => {
        before(() => handle.clear());

        const sleep = delay => new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
        it('and clean cache automaticaly', async () => {
            await handle.set('key#1', from(['a', 'b', 'c']));
            await handle.set('key#2', from(['a', 'b', 'c']));
            await handle.set('key#3', from(['a', 'b', 'c']));
            await handle.set('key#4', from(['a', 'b', 'c']));
            await handle.set('key#5', from(['a', 'b', 'c']));
            await handle.set('key#6', from(['a', 'b', 'c']));
            const entries1 = await handle.all();
            assert.equal(Object.keys(entries1).length, 6);
            await sleep(1000);
            const entries2 = await handle.all();
            assert.equal(Object.keys(entries2).length, 2);
        });
    });
});

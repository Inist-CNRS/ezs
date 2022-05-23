import pathExists from 'path-exists';
import { tmpdir } from 'os';
import mkdirp from 'mkdirp';
import ezs from '../../core/src';
import { createStore, createStoreWithID, createPersistentStore } from '../src/store';

describe('Store', () => {
    it('add distinct values #0', async (done) => {
        const location = `${tmpdir()}/toto`;
        mkdirp.sync(`${location}/store`);
        const store = createStore(ezs, 'test_store0', location);
        expect(store.id()).toEqual(expect.stringContaining('test_store0'));
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const output = [];
        const stream = await store.cast();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value[0]).toEqual('A');
                await store.close();
                done();
            });
    });


    it('add distinct values #1', async (done) => {
        const store = createStore(ezs, 'test_store1');
        expect(store.id()).toEqual(expect.stringContaining('test_store1'));
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const output = [];
        const stream = await store.cast();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value[0]).toEqual('A');
                await store.close();
                done();
            });
    });

    it('add distinct values #2', async (done) => {
        const store = createStore(ezs, 'test_store2');
        expect(store.id()).toEqual(expect.stringContaining('test_store2'));
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const output = [];
        const stream = await store.cast();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value[0]).toEqual('A');
                await store.close();
                done();
            });
    });


    it('add distinct values #3', async (done) => {
        const store = createStore(ezs, 'test_store3');
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const k1 = await store.get(1);
        expect(k1.shift()).toEqual('A');
        const k2 = await store.get(2);
        expect(k2.shift()).toEqual('B');
        const k3 = await store.get(3);
        expect(k3.shift()).toEqual('C');
        await store.close();
        done();
    });

    it('add distinct values #4', async (done) => {
        const store = createStoreWithID(ezs, 'test_store4');
        expect(store.id()).toEqual('test_store4');
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const output = [];
        const stream = await store.empty();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value[0]).toEqual('A');
                await store.close();
                done();
            });
    });


    it('add duplicate keys', async (done) => {
        const store = createStore(ezs, 'test_store2');
        await store.add(1, 'A');
        await store.add(2, 'B');
        await store.add(2, 'X');
        await store.add(2, 'D');
        await store.add(3, 'C');
        await store.add(1, 'A');
        await store.add(1, 'A');
        await store.add(1, 'R');
        const output = [];
        const stream = await store.cast();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value.length).toEqual(4);
                expect(output[1].value.length).toEqual(3);
                expect(output[2].value.length).toEqual(1);
                await store.close();
                done();
            });
    });

    it('put duplicate keys', async (done) => {
        const store = createStore(ezs, 'test_store2');
        await store.put(1, 'A');
        await store.put(2, 'B');
        await store.put(2, 'X');
        await store.put(2, 'D');
        await store.put(3, 'C');
        await store.put(1, 'A');
        await store.put(1, 'A');
        await store.put(1, 'R');
        const output = [];
        const stream = await store.cast();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value).toEqual('R');
                expect(output[1].value.length).toEqual(1);
                expect(output[1].value).toEqual('D');
                expect(output[2].value.length).toEqual(1);
                expect(output[2].value).toEqual('C');
                await store.close();
                done();
            });
    });

    it('add no value #1', async (done) => {
        const store = createStore(ezs, 'test_store6');
        expect(store.id()).toEqual(expect.stringContaining('test_store6'));
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const k1 = await store.get(1);
        expect(k1.shift()).toEqual('A');
        const k2 = await store.get(2);
        expect(k2.shift()).toEqual('B');
        const k3 = await store.get(3);
        expect(k3.shift()).toEqual('C');
        const k4 = await store.get(4);
        expect(k4).toBeNull();
        await store.close();
        done();
    });

    it('put and cut #1', async (done) => {
        const store = createStore(ezs, 'test_store7');
        expect(store.id()).toEqual(expect.stringContaining('test_store7'));
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const k1 = await store.cut(1);
        expect(k1.shift()).toEqual('A');
        const k2 = await store.cut(2);
        expect(k2.shift()).toEqual('B');
        const k3 = await store.cut(3);
        expect(k3.shift()).toEqual('C');
        const k4 = await store.cut(4);
        expect(k4).toBeNull();

        const output = [];
        const stream = await store.cast();
        stream
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output.length).toEqual(0);
                await store.close();
                done();
            });
    });

    it('persistentStore  #0', async (done) => {
        const location = `${tmpdir()}/toto`;
        mkdirp.sync(`${location}/store`);
        const store = createPersistentStore(ezs, 'test_storeX', location);
        expect(store.persistent).toEqual(true);
        expect(pathExists.sync(`${location}/store/persistent/test_storeX`)).toEqual(true);
        await store.close();
        expect(pathExists.sync(`${location}/store/persistent/test_storeX`)).toEqual(true);
        done();
    });
    it('persistentStore  #1', async (done) => {
        const location = `${tmpdir()}/toto`;
        mkdirp.sync(`${location}/store`);
        const store = createStore(ezs, 'test_storeY', location);
        expect(store.persistent).toEqual(false);
        await store.close();

        expect(pathExists.sync(`${location}/store/persistent/test_storeY`)).toEqual(false);
        done();
    });

});

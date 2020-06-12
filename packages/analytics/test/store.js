import ezs from '../../core/src';
import { createStore }  from '../src/store';

describe('Store', () => {
    it('add distinct values', async (done) => {
        const store = createStore(ezs, 'test_store1');
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const output = [];
        store
            .cast()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value[0]).toEqual('A');
                store.close();
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
        store
            .cast()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value.length).toEqual(4);
                expect(output[1].value.length).toEqual(3);
                expect(output[2].value.length).toEqual(1);
                store.close();
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
        store
            .cast()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value).toEqual('R');
                expect(output[1].value.length).toEqual(1);
                expect(output[1].value).toEqual('D');
                expect(output[2].value.length).toEqual(1);
                expect(output[2].value).toEqual('C');
                store.close();
                done();
            });
    });

});

import parallel from 'array-parallel';
import ezs from '../../core/src';
import Store from '../src/store';

describe('With one store', () => {
    it('add distinct values', async (done) => {
        const store = new Store(ezs, 'test_store1');
        await Promise.all([
            store.add(1, 'A'),
            store.add(2, 'B'),
            store.add(3, 'C'),
        ]);
        const output = [];
        store
            .empty()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value[0]).toEqual('A');
                done();
            });
    });

    it('add duplicate keys', async (done) => {
        const store = new Store(ezs, 'test_store2');
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
            .empty()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(3);
                expect(output[0].id).toEqual(1);
                expect(output[0].value.length).toEqual(4);
                expect(output[1].value.length).toEqual(3);
                expect(output[2].value.length).toEqual(1);
                done();
            });
    });

    it('put duplicate keys', async (done) => {
        const store = new Store(ezs, 'test_store2bis');
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
            .empty()
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
                done();
            });
    });
});

describe('With shared store #1', () => {
    const store1 = new Store(ezs, 'test_store3');
    const store2 = new Store(ezs, 'test_store3');
    const store3 = new Store(ezs, 'test_store3');
    const store4 = new Store(ezs, 'test_store3');

    it('run 3 times the same instructions', (alldone) => parallel(
        [
            async (done) => {
                await store1.add(1, 'A');
                await store1.add(2, 'B');
                await store1.add(3, 'C');
                done();
            },
            async (done) => {
                await store2.add(1, 'A');
                await store2.add(2, 'B');
                await store2.add(3, 'C');
                done();
            },
            async (done) => {
                await store3.add(1, 'A');
                await store3.add(2, 'B');
                await store3.add(3, 'C');
                done();
            },
        ],
        this,
        () => {
            const output = [];
            store4
                .empty()
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => {
                    expect(output.length).toEqual(3);
                    expect(output[0].id).toEqual(1);
                    expect(output[0].value[0]).toEqual('A');
                    expect(output[1].id).toEqual(2);
                    expect(output[1].value[0]).toEqual('B');
                    expect(output[2].id).toEqual(3);
                    expect(output[2].value[0]).toEqual('C');
                    alldone();
                });
        },
    ));
});

describe('With shared store #2', () => {
    const store1 = new Store(ezs, 'test_store4');
    const store2 = new Store(ezs, 'test_store4');
    const store3 = new Store(ezs, 'test_store4');
    const store4 = new Store(ezs, 'test_store4');

    it('run 3 times the different instructions', (alldone) => parallel(
        [
            async (done) => {
                await store1.add(1, 'A');
                await store1.add(2, 'B');
                await store1.add(3, 'C');
                done();
            },
            async (done) => {
                await store2.add(4, 'A');
                await store2.add(5, 'B');
                await store2.add(6, 'C');
                done();
            },
            async (done) => {
                await store3.add(7, 'A');
                await store3.add(8, 'B');
                await store3.add(9, 'C');
                done();
            },
        ],
        this,
        () => {
            const output = [];
            store4
                .empty()
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => {
                    expect(output.length).toEqual(9);
                    expect(output[0].id).toEqual(1);
                    expect(output[0].value[0]).toEqual('A');
                    expect(output[3].id).toEqual(4);
                    expect(output[3].value[0]).toEqual('A');
                    expect(output[6].id).toEqual(7);
                    expect(output[6].value[0]).toEqual('A');
                    alldone();
                });
        },
    ));
});


describe('With shared store #2', () => {
    const store1 = new Store(ezs, 'test_store5');
    const store2 = new Store(ezs, 'test_store5');
    const store3 = new Store(ezs, 'test_store5');

    it('run 3 times stream instructions', (alldone) => parallel(
        [
            async (done) => {
                await store1.add(1, 'A');
                await store1.add(2, 'B');
                await store1.add(3, 'C');
                const output = [];
                store1
                    .stream()
                    .on('data', (chunk) => {
                        output.push(chunk.value[0]);
                    })
                    .on('end', () => {
                        expect(output).toEqual(expect.arrayContaining(['A', 'B', 'C']));
                        done();
                    });
            },
            async (done) => {
                await store2.add(4, 'D');
                await store2.add(5, 'E');
                await store2.add(6, 'F');
                const output = [];
                store2
                    .stream()
                    .on('data', (chunk) => {
                        output.push(chunk.value[0]);
                    })
                    .on('end', () => {
                        expect(output).toEqual(expect.arrayContaining(['D', 'E', 'F']));
                        done();
                    });
            },
            async (done) => {
                await store3.add(7, 'G');
                await store3.add(8, 'H');
                await store3.add(9, 'I');
                const output = [];
                store3
                    .stream()
                    .on('data', (chunk) => {
                        output.push(chunk.value[0]);
                    })
                    .on('end', () => {
                        expect(output).toEqual(expect.arrayContaining(['G', 'H', 'I']));
                        done();
                    });
            },
        ],
        this,
        alldone,
    ));
});

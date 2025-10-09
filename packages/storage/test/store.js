import parallel from 'array-parallel';
import ezs from '../../core/src';
import storeFactory from '../src/store';

describe('With one store', () => {
    it('put distinct values', async (done) => {
        const store = await storeFactory(ezs, 'test_store1');
        await Promise.all([
            store.put(1, 'A'),
            store.put(2, 'B'),
            store.put(3, 'C'),
        ]);
        const output = [];
        store
            .empty()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                const outputSorted = output.sort((x, y) => (x.id > y.id) ? 1 : -1);
                expect(output.length).toEqual(3);
                expect(outputSorted[0].id).toEqual(1);
                expect(outputSorted[0].value[0]).toEqual('A');
                done();
            });
    });

    it('put duplicate keys', async (done) => {
        const store = await storeFactory(ezs, 'test_store2');
        await store.put(1, 'A', 1);
        await store.put(2, 'B', 2);
        await store.put(2, 'C', 3); // <=
        await store.put(3, 'D', 4);
        await store.put(3, 'F', 6); // <=
        await store.put(3, 'E', 5);
        const output = [];
        store
            .empty()
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                const outputSorted = output.sort((x, y) => (x.id > y.id) ? 1 : -1);
                expect(output.length).toEqual(3);
                expect(outputSorted[0].value).toEqual('A');
                expect(outputSorted[1].value).toEqual('C');
                expect(outputSorted[2].value).toEqual('F');
                done();
            });
    });

    it('put duplicate keys', async (done) => {
        const store = await storeFactory(ezs, 'test_store2bis');
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
                const outputSorted = output.sort((x, y) => (x.id > y.id) ? 1 : -1);
                expect(output.length).toEqual(3);
                expect(outputSorted[0].id).toEqual(1);
                expect(outputSorted[0].value).toEqual('R');
                expect(outputSorted[1].value.length).toEqual(1);
                expect(outputSorted[1].value).toEqual('D');
                expect(outputSorted[2].value.length).toEqual(1);
                expect(outputSorted[2].value).toEqual('C');
                done();
            });
    });
});

describe('With shared store #1', () => {
    it('run 3 times the same instructions', async (alldone) => {
        const store1 = await storeFactory(ezs, 'test_store3');
        const store2 = await storeFactory(ezs, 'test_store3');
        const store3 = await storeFactory(ezs, 'test_store3');
        const store4 = await storeFactory(ezs, 'test_store3');
        parallel(
            [
                async (done) => {
                    await store1.put(1, 'A');
                    await store1.put(2, 'B');
                    await store1.put(3, 'C');
                    done();
                },
                async (done) => {
                    await store2.put(1, 'A');
                    await store2.put(2, 'B');
                    await store2.put(3, 'C');
                    done();
                },
                async (done) => {
                    await store3.put(1, 'A');
                    await store3.put(2, 'B');
                    await store3.put(3, 'C');
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
                        const outputSorted = output.sort((x, y) => (x.id > y.id) ? 1 : -1);
                        expect(output.length).toEqual(3);
                        expect(outputSorted[0].id).toEqual(1);
                        expect(outputSorted[0].value[0]).toEqual('A');
                        expect(outputSorted[1].id).toEqual(2);
                        expect(outputSorted[1].value[0]).toEqual('B');
                        expect(outputSorted[2].id).toEqual(3);
                        expect(outputSorted[2].value[0]).toEqual('C');
                        alldone();
                    });
            },
        );
    });
});

describe('With shared store #2', () => {
    it('run 3 times the different instructions', async (alldone) => {
        const store1 = await storeFactory(ezs, 'test_store4');
        const store2 = await storeFactory(ezs, 'test_store4');
        const store3 = await storeFactory(ezs, 'test_store4');
        const store4 = await storeFactory(ezs, 'test_store4');
        parallel(
            [
                async (done) => {
                    await store1.put(1, 'A');
                    await store1.put(2, 'B');
                    await store1.put(3, 'C');
                    done();
                },
                async (done) => {
                    await store2.put(4, 'A');
                    await store2.put(5, 'B');
                    await store2.put(6, 'C');
                    done();
                },
                async (done) => {
                    await store3.put(7, 'A');
                    await store3.put(8, 'B');
                    await store3.put(9, 'C');
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
                        const outputSorted = output.sort((x, y) => (x.id > y.id) ? 1 : -1);
                        expect(output.length).toEqual(9);
                        expect(outputSorted[0].id).toEqual(1);
                        expect(outputSorted[0].value[0]).toEqual('A');
                        expect(outputSorted[3].id).toEqual(4);
                        expect(outputSorted[3].value[0]).toEqual('A');
                        expect(outputSorted[6].id).toEqual(7);
                        expect(outputSorted[6].value[0]).toEqual('A');
                        alldone();
                    });
            },
        );
    });
});


describe('With shared store #2', () => {
    it('run 3 times stream instructions', async (alldone) => {
        const store1 = await storeFactory(ezs, 'test_store5');
        const store2 = await storeFactory(ezs, 'test_store5');
        const store3 = await storeFactory(ezs, 'test_store5');
        parallel(
            [
                async (done) => {
                    await store1.put(1, 'A');
                    await store1.put(2, 'B');
                    await store1.put(3, 'C');
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
                    await store2.put(4, 'D');
                    await store2.put(5, 'E');
                    await store2.put(6, 'F');
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
                    await store3.put(7, 'G');
                    await store3.put(8, 'H');
                    await store3.put(9, 'I');
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
        );
    });
});

describe('With simple store', () => {
    it('put and get values', async (done) => {
        const store = await storeFactory(ezs, 'test_storeX');
        await store.put(1, 'A');
        //  call #1
        expect(await store.get(1)).toEqual('A');
        // call #2 (no cache)
        expect(await store.get(1)).toEqual('A');
        done();
    });
    it('put and get values (with cache)', async (done) => {
        ezs.settings.cacheEnable = true;
        const store = await storeFactory(ezs, 'test_storeX');
        ezs.settings.cacheEnable = false;
        await store.put(1, 'A');
        //  call #1
        expect(await store.get(1)).toEqual('A');
        // call #2 (with cache)
        expect(await store.get(1)).toEqual('A');
        done();
    });

});

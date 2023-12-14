import ezs from '@ezs/core/src';
import from from 'from';
import assert from 'assert';
import tune from '../src/tune';

ezs.addPath(__dirname);

const simpleData =  [
    {
        'id': 1,
        'value': 1
    },
    {
        'id': 2,
        'value': 2
    }
];

const arrayData =  [
    {
        'id': 1,
        'value': [1, 1]
    },
    {
        'id': 2,
        'value': [2, 2]
    }
];

describe('tune', () => {

    describe('normalize, simple object', () => {

        it('should normalize (path = id)', async () => {
            ezs.use({ tune });

            const res = await (new Promise((resolve) => {
                const result = [];
                from(simpleData)
                    .pipe(ezs('tune'))
                    .on('data', (chunk) => {
                        assert(typeof chunk === 'object');
                        result.push(chunk);
                    })
                    .on('end', () => {
                        resolve(result);
                    });
            }));

            assert.equal(res[0].id, '0000000000000000001.00000000000000000000');
            assert.equal(res[1].id, '0000000000000000002.00000000000000000000');

            assert.equal(res[0].value, simpleData[0]);
            assert.equal(res[1].value, simpleData[1]);
        });

        it('should normalize (path = value)', async () => {
            ezs.use({ tune });

            const res = await (new Promise((resolve) => {
                const result = [];
                from(simpleData)
                    .pipe(ezs('tune', { path: 'value' }))
                    .on('data', (chunk) => {
                        assert(typeof chunk === 'object');
                        result.push(chunk);
                    })
                    .on('end', () => {
                        resolve(result);
                    });
            }));

            assert.equal(res[0].id, '0000000000000000001.00000000000000000000');
            assert.equal(res[1].id, '0000000000000000002.00000000000000000000');

            assert.equal(res[0].value, simpleData[0]);
            assert.equal(res[1].value, simpleData[1]);
        });
    });

    describe('normalize, array object', () => {

        it('should normalize (path = id)', async () => {
            ezs.use({ tune });

            const res = await (new Promise((resolve) => {
                const result = [];
                from(arrayData)
                    .pipe(ezs('tune'))
                    .on('data', (chunk) => {
                        assert(typeof chunk === 'object');
                        result.push(chunk);
                    })
                    .on('end', () => {
                        resolve(result);
                    });
            }));

            assert.equal(res[0].id, '0000000000000000001.00000000000000000000');
            assert.equal(res[1].id, '0000000000000000002.00000000000000000000');

            assert.equal(res[0].value, arrayData[0]);
            assert.equal(res[1].value, arrayData[1]);
        });

        it('should normalize (path = value)', async () => {
            ezs.use({ tune });

            const res = await (new Promise((resolve) => {
                const result = [];
                from(arrayData)
                    .pipe(ezs('tune', { path: 'value' }))
                    .on('data', (chunk) => {
                        assert(typeof chunk === 'object');
                        result.push(chunk);
                    })
                    .on('end', () => {
                        resolve(result);
                    });
            }));

            assert.equal(res[0].id, '1.1');
            assert.equal(res[1].id, '2.2');

            assert.equal(res[0].value, arrayData[0]);
            assert.equal(res[1].value, arrayData[1]);
        });
    });
});
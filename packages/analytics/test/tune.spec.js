import ezs from '@ezs/core/src';
import from from 'from';
import assert from 'assert';
import tune from '../src/tune';

ezs.addPath(__dirname);

const simpleObject =  [
    {
        id: 1,
        value: 1
    },
    {
        id: 2,
        value: 2
    }
];

describe('tune', () => {
    it('should normalize simple object', async () => {
        ezs.use({ tune });

        const res = await (new Promise((resolve) => {
            const result = [];
            from(simpleObject)
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

        assert.equal(res[0].value, simpleObject[0]);
        assert.equal(res[1].value, simpleObject[1]);
    });
});
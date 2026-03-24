import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

describe('openalexfetch', () => {
    test.skip('#1', (done) => {
        ezs.use(statements);
        const input = [
            {
                filter: 'authorships.author.id:a5000387389',
                'per-page': 200,
            },
        ];
        const output = [];
        from(input)
            .pipe(ezs('OAFetch', { retries: 1, timeout: 50000 }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(487);
                done();
            });
    }, 60000);
});

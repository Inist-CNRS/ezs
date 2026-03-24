import from from 'from';
import { env } from 'process';
import ezs from '../../core/src';
import statements from '../src';

describe('wosfetch', () => {
    test.skip('#1', (done) => {
        ezs.use(statements);
        const input = [
            {
                usrQuery: 'TI=Forest AND CU=France AND PY=2025',
                databaseId: 'WOK',
                optionView: 'FS',
                sortField: 'LD+D',
            },
        ];
        const output = [];
        from(input)
            .pipe(ezs('WOSFetch', {
                retries: 1,
                timeout: 50000,
                url: 'https://wos-api.clarivate.com/api/wos',
                token: env.WOS_API_KEY,
                step: 12,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(148);
                done();
            });
    }, 60000);
});

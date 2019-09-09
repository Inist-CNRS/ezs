import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

test('get an error when empty link', (done) => {
    from([{ linkQuery: '' }])
        .pipe(ezs('SPARQLDecodeQuery'))
        .pipe(ezs.catch((e) => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('No share link given !'));
            done();
        });
});

test('get an error when incorrect link', (done) => {
    from([{ linkQuery: 'http://192.168.31.146:49452/triplestore/sparql/#linkincorrect' }])
        .pipe(ezs('SPARQLDecodeQuery'))
        .pipe(ezs.catch((e) => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('Invalid link !'));
            done();
        });
});

test('should have the corresponding query and endpoint', (done) => {
    from([{ linkQuery: 'http://192.168.31.146:49452/triplestore/sparql/#query=SELECT+*%0AWHERE+%7B%0A++%3Fsubject+%3Fverb+%3Fcomplement+.%0A%7D%0ALIMIT+100&contentTypeConstruct=text%2Fturtle&contentTypeSelect=application%2Fsparql-results%2Bjson&endpoint=https%3A%2F%2Fdata.istex.fr%2Fsparql%2F&requestMethod=POST&tabTitle=Query&headers=%7B%7D&outputFormat=table' }])
        .pipe(ezs('SPARQLDecodeQuery'))
        .on('data', (data) => {
            const { query, endpoint } = data;
            assert.strictEqual(query, `SELECT *
WHERE {
  ?subject ?verb ?complement .
}
LIMIT 100`);
            assert.strictEqual(endpoint, 'https://data.istex.fr/sparql/');
            done();
        })
        .on('error', done);
});

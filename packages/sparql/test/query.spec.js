import ezs from 'ezs';
import from from 'from';
import statements from '../src';

ezs.use(statements);

test('get response', (done) => {
    from([{ query: '', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .on('data', (data) => {
            done();
        })
        .on('error', done);
});

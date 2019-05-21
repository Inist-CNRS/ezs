import assert from 'assert';
import ezs from 'ezs';
import from from 'from';
import statements from '../src';

ezs.use(statements);

test('get an error when empty query', (done) => {
    from([{ query: '', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.strictEqual(error.message, 'No query given!');
            done();
        });
});

test('get an error when empty SPQARQL endpoint', (done) => {
    from([{ query: 'SELECT * WHERE { ?subject ?verb ?complement . } LIMIT 100', endpoint: '' }])
        .pipe(ezs('SPARQLQuery'))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.strictEqual(error.message, 'No sparql endpoint given !');
            done();
        });
});


test('get response', (done) => {
    // TODO: add query
    from([{ query: 'SELECT DISTINCT ?g, count(*) AS ?nb WHERE { graph ?g { ?s ?p ?o }}', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .on('data', (data) => {
            // TODO add assertion(s)
            done();
        })
        .on('error', done);
});

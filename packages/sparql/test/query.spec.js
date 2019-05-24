import assert from 'assert';
import ezs from 'ezs';
import from from 'from';
import statements from '../src';

ezs.use(statements);

test('get an error when empty query', (done) => {
    from([{ query: '', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs.catch(e => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('No query given!'));
            done();
        });
});

test('get an error when empty SPQARQL endpoint', (done) => {
    from([{ query: 'SELECT * WHERE { ?subject ?verb ?complement . } LIMIT 100', endpoint: '' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs.catch(e => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('No sparql endpoint given !'));
            done();
        });
});

test('get an error when incorrect SPARQL endpoint', (done) => {
    from([{ query: 'SELECT * WHERE { ?subject ?verb ?complement . } LIMIT 100', endpoint: 'https://data.istex.fr/spa' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs.catch(e => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('Can not connect to the sparql endpoint !')
                        || error.message.includes('The data is not JSON object !'));
            done();
        });
});

test('verify format response is in json', (done) => {
    from([{ query: 'SELECT * WHERE { ?subject ?verb ?complement . } LIMIT 100', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs.catch(e => e))
        .on('data', (data) => {
            if (typeof data !== 'object' || !JSON.stringify(data)) {
                done('The data are not a JSON object !');
            }
            if (data.results.bindings.length !== 100) {
                done('Problem with data integrity');
            }

            done();
        })
        .on('error', () => {
            done('There should be no errors !');
        });
});

import assert from 'assert';
import ezs from 'ezs';
import from from 'from';
import statement from '../src';

ezs.use(statement);


test('get an error when result has not enougth columns', (done) => {
    from([{ query: 'SELECT DISTINCT ?p FROM <https://scopus-category.data.istex.fr/graph> WHERE { ?s ?p ?o }', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs('SPARQLToDistinct'))
        .pipe(ezs.catch(e => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('Result of query should have only two columns !'));
            done();
        });
});

test('get an error when result has to many columns', (done) => {
    from([{ query: 'SELECT * WHERE { ?subject ?verb ?complement . } LIMIT 100', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs('SPARQLToDistinct'))
        .pipe(ezs.catch(e => e))
        .on('data', () => {
            done(new Error('Should not work'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('Result of query should have only two columns !'));
            done();
        });
});

test('get an error when the second column is not a number', (done) => {
    from([{ query: 'SELECT ?s, ?p  WHERE { ?s ?p ?o } LIMIT 10', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs('SPARQLToDistinct'))
        .pipe(ezs.catch(e => e))
        .on('data', () => {
            done(new Error('Should not work !'));
        })
        .on('error', (error) => {
            assert.ok(error.message.includes('The second column should contains only numbers'));
            done();
        });
});

test('verify result information and structure', (done) => {
    from([{ query: 'SELECT DISTINCT ?g, count(*) AS ?nb WHERE { graph ?g { ?s ?p ?o } } LIMIT 5', endpoint: 'https://data.istex.fr/sparql/' }])
        .pipe(ezs('SPARQLQuery'))
        .pipe(ezs('SPARQLToDistinct'))
        .pipe(ezs.catch(e => e))
        .on('data', (data) => {
            if (typeof data !== 'object' || !JSON.stringify(data)) {
                done(new Error('The data are not a JSON object !'));
            }
            if (data.total !== 5) {
                done(new Error('The total should be set to 5'));
            }

            data.data.forEach((elem) => {
                if (!elem._id || !elem.value) {
                    done(new Error('Each element should have an _id field and a value field'));
                }
                if (Number.isNaN(elem.value)) {
                    done(new Error('Value field of each element should be a number'));
                }
            });

            done();
        })
        .on('error', (error) => {
            done(error);
        });
}, 30000);

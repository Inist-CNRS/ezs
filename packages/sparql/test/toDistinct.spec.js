import assert from 'assert';
import ezs from 'ezs';
import from from 'from';
import statement from '../src';

ezs.use(statement);

test('get an error when result has not enougth columns', (done) => {
    from([JSON.parse(`{ "head": { "link": [], "vars": ["p"] },
    "results": { "distinct": false, "ordered": true, "bindings": [
      { "p": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }},
      { "p": { "type": "uri", "value": "http://purl.org/dc/terms/created" }},
      { "p": { "type": "uri", "value": "http://purl.org/dc/terms/modified" }} ] } }`)])
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
    from([JSON.parse(`{ "head": { "link": [], "vars": ["subject", "verb", "complement"] },
    "results": { "distinct": false, "ordered": true, "bindings": [
      { "subject": { "type": "uri", "value": "http://www.openlinksw.com/virtrdf-data-formats#default-iid" }, "verb": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }, "complement": { "type": "uri", "value": "http://www.openlinksw.com/schemas/virtrdf#QuadMapFormat" }},
      { "subject": { "type": "uri", "value": "http://www.openlinksw.com/virtrdf-data-formats#default-iid-nullable" }, "verb": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }, "complement": { "type": "uri", "value": "http://www.openlinksw.com/schemas/virtrdf#QuadMapFormat" }},
      { "subject": { "type": "uri", "value": "http://www.openlinksw.com/virtrdf-data-formats#default-iid-nonblank" }, "verb": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }, "complement": { "type": "uri", "value": "http://www.openlinksw.com/schemas/virtrdf#QuadMapFormat" }} ] } }`)])
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
    from([JSON.parse(`{ "head": { "link": [], "vars": ["s", "p"] },
    "results": { "distinct": false, "ordered": true, "bindings": [
      { "s": { "type": "uri", "value": "http://www.openlinksw.com/virtrdf-data-formats#default-iid" }, "p": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }},
      { "s": { "type": "uri", "value": "http://www.openlinksw.com/virtrdf-data-formats#default-iid-nullable" }, "p": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }},
      { "s": { "type": "uri", "value": "http://www.openlinksw.com/virtrdf-data-formats#default-iid-nonblank" }, "p": { "type": "uri", "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" }} ] } }`)])
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
    from([JSON.parse(`{ "head": { "link": [], "vars": ["g", "nb"] },
                 "results": { "distinct": false, "ordered": true, "bindings": [
                 { "g": { "type": "uri", "value": "http://www.openlinksw.com/schemas/virtrdf#" }, "nb": { "type": "typed-literal", "datatype": "http://www.w3.org/2001/XMLSchema#integer", "value": "2477" }},
                 { "g": { "type": "uri", "value": "https://bibliography.data.istex.fr/notice/graph" }, "nb": { "type": "typed-literal", "datatype": "http://www.w3.org/2001/XMLSchema#integer", "value": "308023584" }},
                 { "g": { "type": "uri", "value": "https://scopus-category.data.istex.fr/graph" }, "nb": { "type": "typed-literal", "datatype": "http://www.w3.org/2001/XMLSchema#integer", "value": "2542" }} ] } }`)])
        .pipe(ezs('SPARQLToDistinct'))
        .pipe(ezs.catch(e => e))
        .on('data', (data) => {
            assert.strictEqual(typeof data, 'object');
            assert.ok(JSON.stringify(data));
            assert.strictEqual(data.total, 3);

            data.data.forEach((elem) => {
                assert.ok(elem.id);
                assert.ok(elem.value);
                assert.ok(Number.isInteger(elem.value));
            });

            done();
        })
        .on('error', done);
}, 30000);

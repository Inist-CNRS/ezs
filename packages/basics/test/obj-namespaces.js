import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('OBJNamespaces', () => {
    it('one namespace', (done) => {
        const result = [];
        from([{
            baseline: 0,
            'http://purl.org/dc/terms/title': 1,
        }])
            .pipe(ezs('OBJNamespaces', {
                prefix: 'dc:',
                namespace: 'http://purl.org/dc/terms/',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (data) => result.push(data))
            .on('end', () => {
                expect(result[0]).toStrictEqual({
                    baseline: 0,
                    'dc:title': 1,
                });
                done();
            });
    });
    it('two namespace', (done) => {
        const result = [];
        from([{
            baseline: 0,
            'http://purl.org/dc/terms/title': 1,
            'http://www.w3.org/2004/02/skos/core#prefLabel': 2,
        }])
            .pipe(ezs('OBJNamespaces', {
                prefix: ['dc:', 'skos:'],
                namespace: ['http://purl.org/dc/terms/', 'http://www.w3.org/2004/02/skos/core#'],
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (data) => result.push(data))
            .on('end', () => {
                expect(result[0]).toStrictEqual({
                    baseline: 0,
                    'dc:title': 1,
                    'skos:prefLabel': 2,
                });
                done();
            });
    });

    it('with one reference', (done) => {
        const result = [];
        from([{
            baseline: 0,
            'http://fake#1': 'a',
            'http://purl.org/dc/terms/title': 1,
        },
        {
            baseline: 0,
            'http://fake#2': 'b',
            'http://purl.org/dc/terms/title': 1,
            'http://www.w3.org/2004/02/skos/core#broader': 'http://fake#1',
        }])
            .pipe(ezs('OBJNamespaces', {
                prefix: ['dc:', 'skos:', 'fake:'],
                namespace: ['http://purl.org/dc/terms/', 'http://www.w3.org/2004/02/skos/core#', 'http://fake#'],
                reference: 'broader$',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (data) => result.push(data))
            .on('end', () => {
                expect(result[0]).toStrictEqual({
                    baseline: 0,
                    'fake:1': 'a',
                    'dc:title': 1,
                });
                expect(result[1]).toStrictEqual({
                    baseline: 0,
                    'fake:2': 'b',
                    'dc:title': 1,
                    'skos:broader': 'fake:1',
                });
                done();
            });
    });
});

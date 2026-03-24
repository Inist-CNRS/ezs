import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('XMLString', () => {
    test('with default parameters', (done) => {
        const output = [];
        from([{ $t: 'a' }])
            .pipe(ezs('XMLString'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const res = output.join('');
                expect(res).toStrictEqual('<items><item>a</item></items>');
                done();
            });
    });
    test('with default parameters and prologue', (done) => {
        const output = [];
        from([{ $t: 'a' }])
            .pipe(ezs('XMLString', { prologue: true }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const res = output.join('');
                expect(res).toStrictEqual('<?xml version="1.0" encoding="UTF-8"?>\n<items><item>a</item></items>');
                done();
            });
    });
    test('with default parameters and prologue', (done) => {
        const output = [];
        from([{ $t: 'a' }])
            .pipe(ezs('XMLString', { prologue: true }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const res = output.join('');
                expect(res).toStrictEqual('<?xml version="1.0" encoding="UTF-8"?>\n<items><item>a</item></items>');
                done();
            });
    });

    test('with custom parameters', (done) => {
        const output = [];
        from([{ $t: 'a', about: 'uid:1' }])
            .pipe(ezs('XMLString', {
                rootElement: 'RDF',
                contentElement: 'Description',
                rootNamespace: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const res = output.join('');
                expect(res).toStrictEqual('<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><Description about="uid:1">a</Description></RDF>');
                done();
            });
    });
    test('with custom namespace', (done) => {
        const output = [];
        from([{ $t: 'a', about: 'uid:1' }])
            .pipe(ezs('XMLString', {
                rootElement: 'RDF',
                contentElement: 'Description',
                rootNamespace: [
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                    'cc: http://creativecommons.org/ns#',
                    'rdfs: http://www.w3.org/2000/01/rdf-schema#',
                ],
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const res = output.join('');
                expect(res).toStrictEqual('<RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"><Description about="uid:1">a</Description></RDF>');
                done();
            });
    });
    test('without root element', (done) => {
        const output = [];
        from([{ $t: 'a' }])
            .pipe(ezs('XMLString', {
                rootElement: '',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                const res = output.join('');
                expect(res).toStrictEqual('<item>a</item>');
                done();
            });
    });
});

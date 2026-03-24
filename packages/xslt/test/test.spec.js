import fs from 'fs';
import ezs from '../../core/lib';
import statements from '../src';

ezs.addPath(__dirname);

const XSL_PATH = 'packages/xslt/test';

describe('saxon', () => {
    test('xslt', (done) => {
        ezs.use(statements);
        const input = '<root>toto</root>';
        const output = [];
        const script = `

            [xslt]
            stylesheet = ${XSL_PATH}/style.xsl

        `;
        const stream = ezs.createStream(ezs.bytesMode());
        stream
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.join('')).toEqual('<?xml version=\"1.0\" encoding=\"UTF-8\"?><root>~toto</root>');
                done();
            });
        stream.write(input);
        stream.end();
    });
    test('xslt without param', (done) => {
        ezs.use(statements);
        const input = '<root>toto</root>';
        const output = [];
        const script = `

            [xslt]
            stylesheet = ${XSL_PATH}/style.xsl
            param = prefix=X

        `;
        const stream = ezs.createStream(ezs.bytesMode());
        stream
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.join('')).toEqual('<?xml version=\"1.0\" encoding=\"UTF-8\"?><root>Xtoto</root>');
                done();
            });
        stream.write(input);
        stream.end();
    });
});
describe('fop', () => {
    test('fop simple.fo', (done) => {
        ezs.use(statements);
        const output = [];
        const script = `

            [fop]

        `;
        const stream = fs.createReadStream(`${__dirname}/simple.fo`);
        stream
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.join('')).toMatch(/^%PDF/);
                done();
            });
    });
});

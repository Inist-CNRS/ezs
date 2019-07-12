import ezs from 'ezs';
import from from 'from';

import statements from '../src';

ezs.use(statements);

describe('convertNQuadsToTurtle', () => {
    it('should convert N-Quads to turtle', (done) => {
        let res = '';
        from([[
            '<http://uri/janedoe> <http://schema.org/jobTitle> "Professor" .',
            '<http://uri/janedoe> <http://schema.org/name> "Jane Doe" .',
            '<http://uri/janedoe> <http://schema.org/telephone> "(425) 123-4567" .',
            '<http://uri/janedoe> <http://schema.org/url> <http://www.janedoe.com> .',
            '<http://uri/janedoe> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/Person> .',
        ].join('\n')])
            .pipe(ezs('parseNQuads'))
            .pipe(ezs('writeTurtle'))
            .on('data', (data) => {
                res += data;
            })
            .on('end', () => {
                expect(res).toEqual([
                    '@prefix schema: <http://schema.org/>.',
                    '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.',
                    '',
                    '<http://uri/janedoe> schema:jobTitle "Professor";',
                    '    schema:name "Jane Doe";',
                    '    schema:telephone "(425) 123-4567";',
                    '    schema:url <http://www.janedoe.com>;',
                    '    a schema:Person.',
                    '',
                ].join('\n'));
                done();
            })
            .on('error', done);
    });
});

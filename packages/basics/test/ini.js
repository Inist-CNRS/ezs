import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('INIString', () => {
    it('should return a string', (done) => {
        const input = [
            { param: 1, section: { arg1: 'a', arg2: 'b' } },
            { param: 1, section: { arg1: 'a', arg2: 'b' } },
            { section: { arg1: 'a', arg2: true } },
            { sec1: { arg1: 'a', arg2: [3, 4, 5] }, sec2: { arg1: 'a', arg2: { x: 1, y: 2 } } },
            { secvide1: {}, secvide2: {} },
        ];
        const output = [];
        from(input)
            .pipe(ezs('INIString'))
            .on('data', (data) => {
                output.push(data);
            })
            .on('end', () => {
                const ini = output.join('');
                expect(ini).toBe(`param = 1
[section]
arg1 = a
arg2 = b
param = 1

[section]
arg1 = a
arg2 = b

[section]
arg1 = a
arg2 = true

[sec1]
arg1 = a
arg2 = [3,4,5]

[sec2]
arg1 = a
arg2 = {"x":1,"y":2}

[secvide1]

[secvide2]
`);
                done();
            });
    });
});

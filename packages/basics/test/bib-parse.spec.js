import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('BIBParse', () => {
    it('should return a entry #1', (done) => {
        from(['@article{my_article,\ntitle = {Hello world},\n', 'journal = "Some Journal"\n}'])
            .pipe(ezs('BIBParse'))
            .on('error', (err) => done(err))
            .on('data', (data) => {
                expect(typeof data).toBe('object');
                expect(data.ObjectType).toBe('entry');
            })
            .on('end', () => {
                done();
            });
    });
    it('should return a entry #2', (done) => {
        from(['@article{my_article,\ntitle = {Hello world},\njournal = "Some Journal"\n}'])
            .pipe(ezs('BIBParse'))
            .on('error', (err) => done(err))
            .on('data', (data) => {
                expect(typeof data).toBe('object');
                expect(data.ObjectType).toBe('entry');
            })
            .on('end', () => {
                done();
            });
    });
    it('should return a entry #3', (done) => {
        from(['@article{my_article,\ntitle = {Hello world},\n', 1, 'journal = "Some Journal"\n}'])
            .pipe(ezs('BIBParse'))
            .on('error', (err) => done(err))
            .on('data', (data) => {
                expect(typeof data).toBe('object');
                expect(data.ObjectType).toBe('entry');
            })
            .on('end', () => {
                done();
            });
    });
    it('should return a entry #3', (done) => {
        from([
            Buffer.from('@article{my_article,\ntitle = {Hello world},\n'),
            Buffer.from('journal = "Some'),
            Buffer.from([0xE2]),
            Buffer.from([0x82]),
            Buffer.from([0xAC]),
            Buffer.from('Journal"\n}'),
            Buffer.from([0xC2]),
        ])
            .pipe(ezs('BIBParse'))
            .on('error', (err) => done(err))
            .on('data', (data) => {
                expect(typeof data).toBe('object');
                expect(data.ObjectType).toBe('entry');
            })
            .on('end', () => {
                done();
            });
    });

    it('should return no entry', (done) => {
        from(['@my_article,\ntitle = {Hello world},\n', 'journal = '])
            .pipe(ezs('BIBParse'))
            .on('error', (err) => done(err))
            .on('data', () => done(new Error('no way')))
            .on('end', () => {
                done();
            });
    });

});

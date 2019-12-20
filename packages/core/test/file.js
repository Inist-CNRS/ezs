import { resolve } from 'path';
import File, { useFile } from '../src/file';
import ezs from '../src';

describe('File ', () => {
    it('load content', (done) => {
        const content = File(ezs, resolve(__dirname, './transit.ini'));
        expect(content).toEqual('[transit]\n\n');
        done();
    });
    it('unable to load content', (done) => {
        const content = File(ezs, './XXXXXXXXXXX.XXX');
        expect(content).toBeFalsy();
        done();
    });
    it('unable to load invalid content', (done) => {
        const content = File(ezs, resolve(__dirname, '../examples/'));
        expect(content).toBeFalsy();
        done();
    });
});

describe('useFile ', () => {
    it('with ', (done) => {
        const content = useFile(ezs, '../../basics/src/index.js');
        expect(content).toEqual(expect.stringContaining('src/index.js'));
        expect(content).toEqual(expect.not.stringContaining('../..'));
        done();
    });
});

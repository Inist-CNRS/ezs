import { resolve } from 'path';
import File from '../src/file';
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

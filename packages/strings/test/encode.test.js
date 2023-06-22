import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('encode', () => {
    it('should encode a field of an object', (done) => {
        let res = [];
        from([{
            value: 'Flow control based 5 MW wind turbine'
        }])
            .pipe(ezs('encode', { path: 'value', from: ['5'], to: ['five']}))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveProperty('value', 'Flow control based five MW wind turbine');
                done();
            });
    });

    it('should encode a string', (done) => {
        let res = [];
        from(['Flow control based 5 MW wind turbine'])
            .pipe(ezs('encode', { from: ['5'], to: ['five']}))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toBe('Flow control based five MW wind turbine');
                done();
            });
    });

    it('should return an error when from and to have not the same length', (done) => {
        let res = [];
        from(['Flow control based 5 MW wind turbine'])
            .pipe(ezs('encode', { from: ['1', '5'], to: ['five']}))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveProperty('message');
                expect(res[0].message).toMatch(/Error: from and to must have the same length/);
                done();
            });
    });
});

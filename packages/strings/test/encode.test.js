import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('encode', () => {
    it('should encode a field of an object', (done) => {
        let res = [];
        from([
            {
                value: 'Flow control based 5 MW wind turbine',
            },
        ])
            .pipe(ezs('encode', { path: 'value', from: ['5'], to: ['five'] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveProperty(
                    'value',
                    'Flow control based five MW wind turbine'
                );
                done();
            });
    });

    it('should encode a string', (done) => {
        let res = [];
        from(['Flow control based 5 MW wind turbine'])
            .pipe(ezs('encode', { from: ['5'], to: ['five'] }))
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
            .pipe(ezs('encode', { from: ['1', '5'], to: ['five'] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveProperty('message');
                expect(res[0].message).toMatch(
                    /Error: from and to must have the same length/
                );
                done();
            });
    });

    it('should work on several strings', (done) => {
        let res = [];
        from([
            'Flow control based 5 MW wind turbine',
            'Motion Characteristics of 10 MW Superconducting Floating Offshore Wind Turbine',
        ])
            .pipe(
                ezs('encode', {
                    from: ['0', '1', '5'],
                    to: ['zero', 'one', 'five'],
                })
            )
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0]).toBe('Flow control based five MW wind turbine');
                expect(res[1]).toBe(
                    'Motion Characteristics of onezero MW Superconducting Floating Offshore Wind Turbine'
                );
                done();
            });
    });

    it('should work with prefix', (done) => {
        let res = [];
        from([
            'Flow control based 5 MW wind turbine',
            'Motion Characteristics of 10 MW',
        ])
            .pipe(
                ezs('encode', {
                    from: ['0', '1', '5'],
                    to: ['zero', 'one', 'five'],
                    prefix: '<',
                })
            )
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0]).toBe('Flow control based <five MW wind turbine');
                expect(res[1]).toBe('Motion Characteristics of <one<zero MW');
                done();
            });
    });

    it('should work with suffix', (done) => {
        let res = [];
        from([
            'Flow control based 5 MW wind turbine',
            'Motion Characteristics of 10 MW',
        ])
            .pipe(
                ezs('encode', {
                    from: ['0', '1', '5'],
                    to: ['zero', 'one', 'five'],
                    suffix: '>',
                })
            )
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0]).toBe('Flow control based five> MW wind turbine');
                expect(res[1]).toBe('Motion Characteristics of one>zero> MW');
                done();
            });
    });

    it('should work with prefix and suffix', (done) => {
        let res = [];
        from([
            'Flow control based 5 MW wind turbine',
            'Motion Characteristics of 10 MW',
        ])
            .pipe(
                ezs('encode', {
                    from: ['0', '1', '5'],
                    to: ['zero', 'one', 'five'],
                    prefix: '<',
                    suffix: '>',
                })
            )
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0]).toBe(
                    'Flow control based <five> MW wind turbine'
                );
                expect(res[1]).toBe('Motion Characteristics of <one><zero> MW');
                done();
            });
    });

    it('should work with digits instead of strings from', (done) => {
        let res = [];
        from(['Flow control based 5 MW wind turbine'])
            .pipe(ezs('encode', { from: [5], to: ['five'] }))
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

    it('should work with digits instead of strings to', (done) => {
        let res = [];
        from(['Flow control based five MW wind turbine'])
            .pipe(ezs('encode', { to: [5], from: ['five'] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toBe('Flow control based 5 MW wind turbine');
                done();
            });
    });

    it('should have a side effect', (done) => {
        let res = [];
        from(['Flow control based 1 MW wind turbine'])
            .pipe(ezs('encode', { from: [1, 2, 3, 4, 5], to: [2, 3, 4, 5, 6] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toBe('Flow control based 6 MW wind turbine');
                done();
            });
    });

    it('should work with strings, not only characters', (done) => {
        let res = [];
        from(['Flow control based 10 MW wind turbine'])
            .pipe(ezs('encode', { from: ['10'], to: ['ten'] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toBe('Flow control based ten MW wind turbine');
                done();
            });
    });
});

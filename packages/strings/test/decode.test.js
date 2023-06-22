import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('decode', () => {
    it('should decode a field of an object', (done) => {
        let res = [];
        from([
            {
                value: 'Flow control based five MW wind turbine',
            },
        ])
            .pipe(ezs('decode', { path: 'value', from: ['5'], to: ['five'] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toHaveProperty(
                    'value',
                    'Flow control based 5 MW wind turbine'
                );
                done();
            });
    });

    it('should decode a string', (done) => {
        let res = [];
        from(['Flow control based five MW wind turbine'])
            .pipe(ezs('decode', { from: ['5'], to: ['five'] }))
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

    it('should return an error when from and to have not the same length', (done) => {
        let res = [];
        from(['Flow control based five MW wind turbine'])
            .pipe(ezs('decode', { from: ['1', '5'], to: ['five'] }))
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
            'Flow control based five MW wind turbine',
            'Motion Characteristics of onezero MW Superconducting Floating Offshore Wind Turbine',
        ])
            .pipe(
                ezs('decode', {
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
                expect(res[0]).toBe('Flow control based 5 MW wind turbine');
                expect(res[1]).toBe(
                    'Motion Characteristics of 10 MW Superconducting Floating Offshore Wind Turbine'
                );
                done();
            });
    });

    it('should work with prefix', (done) => {
        let res = [];
        from([
            'Flow control based <five MW wind turbine',
            'Motion Characteristics of <one<zero MW',
        ])
            .pipe(
                ezs('decode', {
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
                expect(res[0]).toBe('Flow control based 5 MW wind turbine');
                expect(res[1]).toBe('Motion Characteristics of 10 MW');
                done();
            });
    });

    it('should work with suffix', (done) => {
        let res = [];
        from([
            'Flow control based five> MW wind turbine',
            'Motion Characteristics of one>zero> MW',
        ])
            .pipe(
                ezs('decode', {
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
                expect(res[0]).toBe('Flow control based 5 MW wind turbine');
                expect(res[1]).toBe('Motion Characteristics of 10 MW');
                done();
            });
    });

    it('should work with prefix and suffix', (done) => {
        let res = [];
        from([
            'Flow control based <five> MW wind turbine',
            'Motion Characteristics of <one><zero> MW',
        ])
            .pipe(
                ezs('decode', {
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
                    'Flow control based 5 MW wind turbine'
                );
                expect(res[1]).toBe('Motion Characteristics of 10 MW');
                done();
            });
    });

    it('should work with digits instead of strings from', (done) => {
        let res = [];
        from(['Flow control based five MW wind turbine'])
            .pipe(ezs('decode', { from: [5], to: ['five'] }))
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

    it('should work with digits instead of strings to', (done) => {
        let res = [];
        from(['Flow control based 5 MW wind turbine'])
            .pipe(ezs('decode', { to: [5], from: ['five'] }))
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

    it('should have a side effect', (done) => {
        let res = [];
        from(['Flow control based 6 MW wind turbine'])
            .pipe(ezs('decode', { from: [5, 4, 3, 2, 1], to: [6, 5, 4, 3, 2] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toBe('Flow control based 1 MW wind turbine');
                done();
            });
    });

    it('should work with strings, not only characters', (done) => {
        let res = [];
        from(['Flow control based ten MW wind turbine'])
            .pipe(ezs('decode', { from: ['10'], to: ['ten'] }))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toBe('Flow control based 10 MW wind turbine');
                done();
            });
    });
});

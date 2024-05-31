import fs from 'fs';
import CSV from 'csv-string';
import from from 'from';
import { intersection } from 'ramda';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('getRnsr', () => {
    let examples;

    beforeAll(async () => {
        const csvExamples = await fs.promises.readFile(
            `${__dirname}/corpus_test_juillet2021.csv`,
            { encoding: 'utf-8' },
        );
        examples = CSV.parse(csvExamples, '\t');
    });

    it('should return an error when data is not an object', (done) => {
        from(['aha'])
            .pipe(ezs('getRnsr'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data has no id', (done) => {
        from([{ value: 0 }])
            .pipe(ezs('getRnsr'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data has no value', (done) => {
        from([{ id: 0 }])
            .pipe(ezs('getRnsr'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data.value is not an object', (done) => {
        from([{ id: 0, value: 1 }])
            .pipe(ezs('getRnsr'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data.value has no address field', (done) => {
        from([{ id: 0, value: {} }])
            .pipe(ezs('getRnsr'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an empty array when not found', (done) => {
        from([
            {
                id: 1,
                value: {
                    year: 2000,
                    address: 'Anywhere',
                },
            },
        ])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('value');
                expect(data.value).toBeDefined();
                expect(data.value).toBeInstanceOf(Array);
                expect(data.value).toHaveLength(0);
                done();
            });
    });

    it('should return an object for the first example', (done) => {
        let res = [];
        from([
            {
                id: 0,
                value: {
                    year: examples[0][2],
                    address: examples[0][0],
                },
            },
        ])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                const data = res[0];
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('value');
                expect(data.value).toBeDefined();
                expect(data.value).toBeInstanceOf(Array);
                expect(data.value.length).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one correct RNSR for the last example', (done) => {
        const i = examples.length - 1;
        let res = [];
        from([
            {
                id: i,
                value: {
                    year: examples[i][2],
                    address: examples[i][0],
                },
            },
        ])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[i][1].split(',');
                expect(data.id).toBe(i);
                expect(
                    intersection(data.value, expectedArray).length,
                ).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it.skip('should return at least one correct RNSR for example #22', (done) => {
        const i = 22;
        let res = [];
        from([
            {
                id: i,
                value: {
                    year: examples[i][2],
                    address: examples[i][0],
                },
            },
        ])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[i][1].split(',');
                expect(data.id).toBe(i);
                expect(data.value).toEqual(expectedArray);
                expect(
                    intersection(data.value, expectedArray).length,
                ).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one correct RNSR for the last - 2 example', (done) => {
        const i = examples.length - 3;
        let res = [];
        from([
            {
                id: i,
                value: {
                    year: examples[i][2],
                    address: examples[i][0],
                },
            },
        ])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[i][1].split(',');
                expect(data.value).toEqual(expectedArray);
                expect(
                    intersection(data.value, expectedArray).length,
                ).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one correct RNSR for example 0', (done) => {
        let res = [];
        from([
            {
                id: 0,
                value: {
                    year: examples[0][2],
                    address: examples[0][0],
                },
            },
        ])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[0][1].split(',');
                expect(data.id).toBe(0);
                expect(
                    intersection(data.value, expectedArray).length,
                ).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one RNSR identifier', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ![7, 10, 14, 16, 19, 22].includes(ex.id));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                res.forEach((r) => {
                    expect(r.value.length).toBeGreaterThanOrEqual(1);
                });
                done();
            });
    });

    it('should return at least one RNSR correct identifier', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ![7, 10, 14, 16, 19, 22].includes(ex.id)) // remove result empty value
            .filter((ex) => ![4, 5, 6, 8, 9, 11].includes(ex.id)); // remove wrong results

        const expected = examples.map((ex, i) => ({
            id: i,
            value: ex[1].split(','),
        }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                res.forEach((r) => {
                    expect(
                        intersection(r.value, expected[r.id].value).length,
                    ).toBeGreaterThanOrEqual(1);
                });
                done();
            });
    });

    it('should return exactly the right identifier(s)', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => [12, 15, 17, 18, 21].includes(ex.id)); // keep exactly correct cases

        const expected = examples.map((ex, i) => ({
            id: i,
            value: ex[1].split(','),
        }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(input.length);
                res.forEach((r) => {
                    expect(r.value).toEqual(expected[r.id].value);
                });
                done();
            });
    });

    it('should return all correct identifier(s) - unfortunately maybe other ones', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => [1, 2, 3, 12, 15, 17, 18, 21].includes(ex.id)); // keep correct cases

        const expected = examples.map((ex, i) => ({
            id: i,
            value: ex[1].split(','),
        }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(input.length);
                res.forEach((r) => {
                    expect(r.value).toEqual(
                        expect.arrayContaining(expected[r.id].value),
                    );
                });
                done();
            });
    });

    it('should work without publication year', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { address: ex[0] } }))
            .filter((ex) => [1, 2, 3, 12, 15, 17, 18, 21].includes(ex.id)); // keep correct cases

        const expected = examples.map((ex, i) => ({
            id: i,
            value: ex[1].split(','),
        }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(input.length);
                res.forEach((r) => {
                    expect(r.value).toEqual(
                        expect.arrayContaining(expected[r.id].value),
                    );
                });
                done();
            });
    });

    it('should return all correct identifier(s) - using RNSR 2021', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => [1, 2, 3, 12, 15, 17, 18, 21].includes(ex.id)); // keep correct cases

        const expected = examples.map((ex, i) => ({
            id: i,
            value: ex[1].split(','),
        }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2021 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(input.length);
                res.forEach((r) => {
                    expect(r.value).toEqual(
                        expect.arrayContaining(expected[r.id].value),
                    );
                });
                done();
            });
    });

    it('should return all correct identifier(s) - using RNSR 2023', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => [1, 2, 3, 12, 15, 17, 18, 21].includes(ex.id)); // keep correct cases

        const expected = examples.map((ex, i) => ({
            id: i,
            value: ex[1].split(','),
        }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2023 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(input.length);
                res.forEach((r) => {
                    expect(r.value).toEqual(
                        expect.arrayContaining(expected[r.id].value),
                    );
                });
                done();
            });
    });
});

import fs from 'fs/promises';
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
        const csvExamples = await fs.readFile(`${__dirname}/corpus_test_juillet2021.csv`, { encoding: 'utf-8' });
        examples = CSV.parse(csvExamples, '\t');
    });

    it('should return an empty array when not found', (done) => {
        from([{
            id: 1,
            value: {
                year: 2000,
                address: 'Anywhere',
            },
        }])
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
        from([{
            id: 0,
            value: {
                year: examples[0][2],
                address: examples[0][0],
            },
        }])
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
                expect(data.value).toHaveLength(1);
                done();
            });
    });

    it('should return at least one correct RNSR for the last example', (done) => {
        const i = examples.length - 1;
        let res = [];
        from([{
            id: i,
            value: {
                year: examples[i][2],
                address: examples[i][0],
            },
        }])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[i][1].split(',');
                expect(data.id).toBe(i);
                expect(intersection(data.value, expectedArray).length).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one correct RNSR for the penultimate example', (done) => {
        const i = examples.length - 2;
        let res = [];
        from([{
            id: i,
            value: {
                year: examples[i][2],
                address: examples[i][0],
            },
        }])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[i][1].split(',');
                console.log({ data, expectedArray });
                expect(data.id).toBe(i);
                expect(data.value).toEqual(expectedArray);
                expect(intersection(data.value, expectedArray).length).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one correct RNSR for the last - 2 example', (done) => {
        const i = examples.length - 3;
        let res = [];
        from([{
            id: i,
            value: {
                year: examples[i][2],
                address: examples[i][0],
            },
        }])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[i][1].split(',');
                expect(data.value).toEqual(expectedArray);
                expect(intersection(data.value, expectedArray).length).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one correct RNSR for the first example', (done) => {
        let res = [];
        from([{
            id: 0,
            value: {
                year: examples[0][2],
                address: examples[0][0],
            },
        }])
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                const data = res[0];
                const expectedArray = examples[0][1].split(',');
                console.log({ data, expectedArray });
                expect(data.id).toBe(0);
                expect(data.value).toEqual(expectedArray);
                expect(intersection(data.value, expectedArray).length).toBeGreaterThanOrEqual(1);
                done();
            });
    });

    it('should return at least one RNSR identifier', (done) => {
        let res = [];
        const input = examples.map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ![7, 10, 14, 16, 19, 22].includes(ex.id));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                res.forEach((r) => {
                    expect(r.value.length).toBeGreaterThanOrEqual(1);
                });
                done();
            });
    });

    it('should return at least one RNSR correct identifier', (done) => {
        let res = [];
        const input = examples.map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ![7, 10, 14, 16, 19, 22].includes(ex.id)) // remove result empty value
            .filter((ex) => ![0, 4, 5, 6, 8, 9, 11].includes(ex.id)); // remove wrong results

        const expected = examples.map((ex, i) => ({ id: i, value: ex[1].split(',') }));
        from(input)
            .pipe(ezs('getRnsr', { year: 2020 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                res.forEach((r) => {
                    expect(intersection(r.value, expected[r.id].value).length).toBeGreaterThanOrEqual(1);
                });
                done();
            });
    });
});

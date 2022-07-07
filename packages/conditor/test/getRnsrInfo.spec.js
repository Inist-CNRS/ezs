import fs from 'fs';
import CSV from 'csv-string';
import from from 'from';

// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('getRnsrInfo', () => {
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
            .pipe(ezs('getRnsrInfo'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data has no id', (done) => {
        from([{ value: 0 }])
            .pipe(ezs('getRnsrInfo'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data has no value', (done) => {
        from([{ id: 0 }])
            .pipe(ezs('getRnsrInfo'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data.value is not an object', (done) => {
        from([{ id: 0, value: 1 }])
            .pipe(ezs('getRnsrInfo'))
            .pipe(ezs.catch(() => done()))
            .on('data', () => done('Should not work'));
    });

    it('should return an error when data.value has no address field', (done) => {
        from([{ id: 0, value: {} }])
            .pipe(ezs('getRnsrInfo'))
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
            .pipe(ezs('getRnsrInfo', { year: 2020 }))
            .on('data', (data) => {
                expect(data).toHaveProperty('id');
                expect(data).toHaveProperty('value');
                expect(data.value).toBeDefined();
                expect(data.value).toBeInstanceOf(Array);
                expect(data.value).toHaveLength(0);
                done();
            });
    });

    it('should return at least one RNSR match', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ![7, 10, 14, 16, 19, 22].includes(ex.id));
        from(input)
            .pipe(ezs('getRnsrInfo', { year: 2021 }))
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

    it('should return information about 200317442A', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ex.id === 17);

        from(input)
            .pipe(ezs('getRnsrInfo', { year: 2020 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(1);
                expect(res[0].value).toEqual([{
                    an_fermeture: '',
                    annee_creation: '1999',
                    code_postal: '69364',
                    etabAssoc: [{
                        etab: {
                            libelle: 'Centre national de la recherche scientifique',
                            libelleAppauvri: 'centre national de la recherche scientifique',
                            sigle: 'CNRS',
                            sigleAppauvri: 'cnrs',
                        },
                        label: 'UMR',
                        labelAppauvri: 'umr',
                        numero: '5667',
                    }, {
                        etab: {
                            libelle: 'Ecole Normale Supérieure de Lyon',
                            libelleAppauvri: 'ecole normale superieure de lyon',
                            sigle: 'ENS LYON',
                            sigleAppauvri: 'ens lyon',
                        },
                        label: 'UM',
                        labelAppauvri: 'um',
                        numero: '20',
                    }, {
                        etab: {
                            libelle: 'Université Claude Bernard Lyon 1',
                            libelleAppauvri: 'universite claude bernard lyon 1',
                            sigle: 'LYON 1',
                            sigleAppauvri: 'lyon 1',
                        },
                        label: 'UMR',
                        labelAppauvri: 'umr',
                        numero: '5667',
                    }, {
                        etab: {
                            libelle:
                                "Institut national de recherche pour l'agriculture, l'alimentation et l'environnement",
                            libelleAppauvri:
                                'institut national de recherche pour l agriculture, l alimentation et l environnement',
                            sigle: 'INRAE',
                            sigleAppauvri: 'inrae',
                        },
                        label: 'UMR',
                        labelAppauvri: 'umr',
                        numero: '0879',
                    },
                    ],
                    intitule: 'REPRODUCTION ET DEVELOPPEMENT DES PLANTES',
                    intituleAppauvri: 'reproduction et developpement des plantes',
                    num_nat_struct: '200317442A',
                    sigle: 'RDP',
                    sigleAppauvri: 'rdp',
                    ville_postale: 'LYON CEDEX 07',
                    ville_postale_appauvrie: 'lyon cedex 07',
                }]);
                done();
            });
    });

    it('should work without publication year', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { address: ex[0] } }))
            .filter((ex) => ex.id === 15); // keep one correct case

        from(input)
            .pipe(ezs('getRnsrInfo', { year: 2021 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(1);
                expect(res[0].value).toEqual([{
                    an_fermeture: '',
                    annee_creation: '2014',
                    code_postal: '75015',
                    etabAssoc: [
                        {
                            etab: {
                                libelle: 'Centre national de la recherche scientifique',
                                libelleAppauvri: 'centre national de la recherche scientifique',
                                sigle: 'CNRS',
                                sigleAppauvri: 'cnrs',
                            },
                            label: 'UMR',
                            labelAppauvri: 'umr',
                            numero: '8253',
                        },
                        {
                            etab: {
                                libelle: 'Institut national de la sante et de la recherche medicale',
                                libelleAppauvri: 'institut national de la sante et de la recherche medicale',
                                sigle: 'INSERM',
                                sigleAppauvri: 'inserm',
                            },
                            label: 'U',
                            labelAppauvri: 'u',
                            numero: '1151',
                        },
                        {
                            etab: {
                                libelle: 'Université Paris Cité',
                                libelleAppauvri: 'universite paris cite',
                                sigle: 'U PARIS Cité',
                                sigleAppauvri: 'u paris cite',
                            },
                            label: 'UM',
                            labelAppauvri: 'um',
                            numero: '111',
                        },
                    ],
                    intitule: 'Institut Necker Enfants Malades - Centre de médecine moléculaire',
                    intituleAppauvri: 'institut necker enfants malades   centre de medecine moleculaire',
                    num_nat_struct: '201420755D',
                    sigle: 'INEM',
                    sigleAppauvri: 'inem',
                    ville_postale: 'PARIS',
                    ville_postale_appauvrie: 'paris',
                }]);
                done();
            });
    });

    it('should return all correct identifier(s) - using RNSR 2021', (done) => {
        let res = [];
        const input = examples
            .map((ex, i) => ({ id: i, value: { year: ex[2], address: ex[0] } }))
            .filter((ex) => ex.id === 1); // choose correct case

        from(input)
            .pipe(ezs('getRnsrInfo', { year: 2021 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res.length).toBe(1);
                expect(res[0].value).toEqual([{
                    an_fermeture: '',
                    annee_creation: '2010',
                    code_postal: '91191',
                    etabAssoc: [{
                        etab: {
                            libelle: 'Centre national de la recherche scientifique',
                            libelleAppauvri: 'centre national de la recherche scientifique',
                            sigle: 'CNRS',
                            sigleAppauvri: 'cnrs',
                        },
                        label: 'UMR',
                        labelAppauvri: 'umr',
                        numero: '8212',
                    }, {
                        etab: {
                            libelle: 'Université Versailles Saint-Quentin-en-Yvelines',
                            libelleAppauvri: 'universite versailles saint quentin en yvelines',
                            sigle: 'VERSAILLES',
                            sigleAppauvri: 'versailles',
                        },
                        label: 'UMR',
                        labelAppauvri: 'umr',
                        numero: '8212',
                    }, {
                        etab: {
                            libelle: "Commissariat à l'énergie atomique et aux énergies alternatives",
                            libelleAppauvri: 'commissariat a l energie atomique et aux energies alternatives',
                            sigle: 'CEA',
                            sigleAppauvri: 'cea',
                        },
                        label: 'UMR',
                        labelAppauvri: 'umr',
                        numero: '8212',
                    }],
                    intitule: "Laboratoire des Sciences du Climat et de l'Environnement UMR 8212",
                    intituleAppauvri: 'laboratoire des sciences du climat et de l environnement umr 8212',
                    num_nat_struct: '200611689J',
                    sigle: 'LSCE',
                    sigleAppauvri: 'lsce',
                    ville_postale: 'GIF SUR YVETTE CEDEX',
                    ville_postale_appauvrie: 'gif sur yvette cedex',
                }]);
                done();
            });
    });
});

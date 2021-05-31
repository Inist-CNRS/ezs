import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('affAlign', () => {
    it('should end', (done) => {
        from([1, 2])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', () => {})
            .on('end', done);
    });

    it('should accept only objects', (done) => {
        from([1, 2])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                expect(data).toBeInstanceOf(Error);
                done();
            });
    });

    it('should not throw when no etabAssoc', (done) => {
        from([{
            authors: [{
                affiliations: [{
                    address: '49045 ANGERS CEDEX 1 ',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .pipe(ezs.catch(done))
            .on('data', () => {})
            .on('error', done)
            .on('end', () => done());
    });

    it('should accept only objects with authors', (done) => {
        from([{}])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                expect(data).toBeInstanceOf(Error);
                done();
            });
    });

    it('should retrieve several rnsr in one address field', (done) => {
        let res = [];
        from([{
            authors: [{
                affiliations: [{
                    address: 'IRSTEA POREA 33615 - 21078 CNRS UMR6303',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                expect(res).toEqual([{
                    authors: [{
                        affiliations: [{
                            address: 'IRSTEA POREA 33615 - 21078 CNRS UMR6303',
                            conditorRnsr: ['200310864A', '201220440V'],
                        }],
                    }],
                }]);
                done();
            });
    });

    it('should not retrieve rnsr of universities only on sigle', (done) => {
        let res = [];
        from([{
            authors: [{
                affiliations: [{
                    address: 'EA4426, Université Bordeaux Montaigne, Médiation, Information, Communication, Art MICA,'
                        + ' MSHA, 10 esplanade des antilles, 33607 pessac cedex, FR',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => { res = [...res, data]; })
            .on('end', () => {
                expect(res).toEqual([{
                    authors: [{
                        affiliations: [{
                            address: 'EA4426, Université Bordeaux Montaigne, Médiation, Information, Communication,'
                                + ' Art MICA, MSHA, 10 esplanade des antilles, 33607 pessac cedex, FR',
                            conditorRnsr: ['200719511G', '200919217D'],
                        }],
                    }],
                }]);
                done();
            });
    });

    describe('label & numero', () => {
        it('should find the conditorRnsr', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }, {
                authors: [{
                    affiliations: [{
                        address: 'Introuvable',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(2);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: ['200619958X'],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should find the conditorRnsr even in lowercase', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'gdr 2989 université versailles saint-quentin-en-yvelines, 63009',
                    }],
                }],
            }, {
                authors: [{
                    affiliations: [{
                        address: 'Introuvable',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(2);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'gdr 2989 université versailles saint-quentin-en-yvelines, 63009',
                                conditorRnsr: ['200619958X'],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should find the conditorRnsr even without accented chars', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'droits, pouvoirs et societes, CNRS, 13628',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toEqual([{
                        authors: [{
                            affiliations: [{
                                address: 'droits, pouvoirs et societes, CNRS, 13628',
                                conditorRnsr: ['200810699Z'],
                            }],
                        }],
                    }]);
                    done();
                });
        });

        it('should not find the conditorRnsr with only a label', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'GDR Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'GDR Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: [],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should not find the conditorRnsr with only a numero', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: '2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: '2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: [],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should not find the conditorRnsr when numero is before label', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: '2989 GDR Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: '2989 GDR Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: [],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should not find the conditorRnsr when numero is too far away from label', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'GDR noise bla 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'GDR noise bla 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: [],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should not find the conditorRnsr when numero is part of a longer token', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'GDR 2989Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'GDR 2989Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: [],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should not find the conditorRnsr when label is part of a longer token', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'PCRGDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'PCRGDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: [],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should find the conditorRnsr when label and numero are one token', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'GDR2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'GDR2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                                conditorRnsr: ['200619958X'],
                            }],
                        }],
                    });
                    done();
                });
        });

        it('should find the conditorRnsr when label is separated from previous with comma', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'univ montpellier, cnrs, inst natl rech agron, montpellier supagro,u386,umr 5004,'
                            + ' f-34060 montpellier 1, france',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res[0]).toEqual({
                        authors: [{
                            affiliations: [{
                                address: 'univ montpellier, cnrs, inst natl rech agron, montpellier supagro,u386,'
                                    + 'umr 5004, f-34060 montpellier 1, france',
                                conditorRnsr: ['195817959H'],
                            }],
                        }],
                    });
                    done();
                });
        });
    });

    it('should find st martin d heres and not only st', (done) => {
        let res = [];
        from([{
            authors: [{
                affiliations: [{
                    address: 'LAM/IRAM, CNRS, St Martin d Hères',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toEqual({
                    authors: [{
                        affiliations: [{
                            address: 'LAM/IRAM, CNRS, St Martin d Hères',
                            conditorRnsr: ['199921733G'],
                        }],
                    }],
                });
                done();
            });
    });

    it('should not find structure based only on st', (done) => {
        let res = [];
        from([{
            authors: [{
                affiliations: [{
                    address: 'LAM/IRAM, CNRS, St Martin',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toEqual({
                    authors: [{
                        affiliations: [{
                            address: 'LAM/IRAM, CNRS, St Martin',
                            conditorRnsr: [],
                        }],
                    }],
                });
                done();
            });
    });

    it('should find structure with a quote in the address', (done) => {
        let res = [];
        from([{
            authors: [{
                affiliations: [{
                    address: 'LAM/IRAM, CNRS, St Martin d\'Hères',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toEqual({
                    authors: [{
                        affiliations: [{
                            address: 'LAM/IRAM, CNRS, St Martin d\'Hères',
                            conditorRnsr: ['199921733G'],
                        }],
                    }],
                });
                done();
            });
    });

    it('should find structure with a dash in the address', (done) => {
        let res = [];
        from([{
            authors: [{
                affiliations: [{
                    address: 'Nano Grand Est, CNRS, Vandoeuvre-lès-Nancy',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0]).toEqual({
                    authors: [{
                        affiliations: [{
                            address: 'Nano Grand Est, CNRS, Vandoeuvre-lès-Nancy',
                            conditorRnsr: ['200619946J'],
                        }],
                    }],
                });
                done();
            });
    });

    it('should not find structure where numero is in postal code', (done) => {
        let res = [];
        from([{
            xPublicationDate: ['2019-11-19'],
            authors: [{
                affiliations: [{
                    address: 'Université de Montpellier UM, '
                    + 'UMR5253, Centre National de la Recherche Scientifique CNRS, '
                    + 'Institut Charles Gerhardt Montpellier - '
                    + 'Institut de Chimie Moléculaire et des Matériaux de Montpellier '
                    + 'ICGM ICMMM, Bâtiment 15 - CC003 Place Eugène Bataillon - 34095 Montpellier cedex 5, FR',
                }],
            }],
        }])
            .pipe(ezs('affAlign', { year: 2019 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toEqual([{
                    xPublicationDate: ['2019-11-19'],
                    authors: [{
                        affiliations: [{
                            address: 'Université de Montpellier UM, '
                            + 'UMR5253, Centre National de la Recherche Scientifique CNRS, '
                            + 'Institut Charles Gerhardt Montpellier - '
                            + 'Institut de Chimie Moléculaire et des Matériaux de Montpellier '
                            + 'ICGM ICMMM, Bâtiment 15 - CC003 Place Eugène Bataillon - 34095 Montpellier cedex 5, FR',
                            conditorRnsr: ['200711918D'],
                        }],
                    }],
                }]);
                done();
            });
    });

    describe('sigle seul', () => {
        it('should find the conditorRnsr', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'IRSTEA POREA 33615',
                    }],
                }],
            }, {
                authors: [{
                    affiliations: [{
                        address: 'POREA',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(2);
                    expect(res).toEqual([{
                        authors: [{
                            affiliations: [{
                                address: 'IRSTEA POREA 33615',
                                conditorRnsr: ['200310864A'],
                            }],
                        }],
                    }, {
                        authors: [{
                            affiliations: [{
                                address: 'POREA',
                                conditorRnsr: [],
                            }],
                        }],
                    }]);
                    done();
                });
        });

        it('should find the conditorRnsr in lowercase', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'irstea porea 33615',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res).toEqual([{
                        authors: [{
                            affiliations: [{
                                address: 'irstea porea 33615',
                                conditorRnsr: ['200310864A'],
                            }],
                        }],
                    }]);
                    done();
                });
        });
    });

    describe('intitule', () => {
        it('should find the conditorRnsr', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'Pluridisciplinarité au service de l\'observation et de la recherche en environnement'
                            + ' et astronomie 33615 IRSTEA',
                    }],
                }],
            }, {
                authors: [{
                    affiliations: [{
                        address: 'POREA',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(2);
                    expect(res).toEqual([{
                        authors: [{
                            affiliations: [{
                                address: 'Pluridisciplinarité au service de l\'observation et de la recherche en'
                                    + ' environnement et astronomie 33615 IRSTEA',
                                conditorRnsr: ['200310864A'],
                            }],
                        }],
                    }, {
                        authors: [{
                            affiliations: [{
                                address: 'POREA',
                                conditorRnsr: [],
                            }],
                        }],
                    }]);
                    done();
                });
        });

        it('should find the conditorRnsr in lowercase', (done) => {
            let res = [];
            from([{
                authors: [{
                    affiliations: [{
                        address: 'pluridisciplinarité au service de l\'observation et de la recherche en environnement'
                            + ' et astronomie 33615 irstea',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toEqual([{
                        authors: [{
                            affiliations: [{
                                address: 'pluridisciplinarité au service de l\'observation et de la recherche en'
                                    + ' environnement et astronomie 33615 irstea',
                                conditorRnsr: ['200310864A'],
                            }],
                        }],
                    }]);
                    done();
                });
        });
    });

    describe('xPublicationDate', () => {
        it('should not find older structures', (done) => {
            let res = [];
            from([{
                xPublicationDate: ['2018'],
                authors: [{
                    affiliations: [{
                        address: 'GREYC, CNRS, UMR 6072, Université Basse-Normandie Caen',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toEqual([{
                        xPublicationDate: ['2018'],
                        authors: [{
                            affiliations: [{
                                address: 'GREYC, CNRS, UMR 6072, Université Basse-Normandie Caen',
                                conditorRnsr: ['201722568L'],
                            }],
                        }],
                    }]);
                    done();
                });
        });

        it('should not find newer structures', (done) => {
            let res = [];
            from([{
                xPublicationDate: ['2008'],
                authors: [{
                    affiliations: [{
                        address: 'GREYC, CNRS, UMR 6072, Université Basse-Normandie Caen',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toEqual([{
                        xPublicationDate: ['2008'],
                        authors: [{
                            affiliations: [{
                                address: 'GREYC, CNRS, UMR 6072, Université Basse-Normandie Caen',
                                conditorRnsr: ['200012161Y'],
                            }],
                        }],
                    }]);
                    done();
                });
        });

        it('should not find affilation older than structures', (done) => {
            let res = [];
            from([{
                xPublicationDate: ['1998'],
                authors: [{
                    affiliations: [{
                        address: 'GREYC, CNRS, UMR 6072, Université Basse-Normandie Caen',
                    }],
                }],
            }])
                .pipe(ezs('affAlign', { year: 2019 }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toEqual([{
                        xPublicationDate: ['1998'],
                        authors: [{
                            affiliations: [{
                                address: 'GREYC, CNRS, UMR 6072, Université Basse-Normandie Caen',
                                conditorRnsr: [],
                            }],
                        }],
                    }]);
                    done();
                });
        });
    });
});

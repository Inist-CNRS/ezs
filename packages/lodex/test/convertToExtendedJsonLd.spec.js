import ezs from 'ezs';
import from from 'from';
import testOne from './testOne';
import statements from '../src';

ezs.use(statements);
describe('conversion to extended JSON-LD', () => {
    let dataTest;
    let expectedJsonLd;
    let config;

    beforeEach(() => {
        dataTest = [
            {
                lodex: { uri: 'http://localhost:3000/ark:/67375/RZL-F4841DSB-1' },
                content: {
                    arkIstex: 'ark:/67375/6H6-N49F7FRR-Q',
                    doi: ['10.1006/jmaa.2001.7542'],
                    fulltext: [
                        {
                            extension: 'pdf',
                            original: true,
                            mimetype: 'application/pdf',
                            uri:
                                'https://api.istex.fr/document/9AA9EE9B75A6067C28F8119813504932FFD3D5A1/fulltext/pdf',
                        },
                        {
                            extension: 'zip',
                            original: false,
                            mimetype: 'application/zip',
                            uri:
                                'https://api.istex.fr/document/9AA9EE9B75A6067C28F8119813504932FFD3D5A1/fulltext/zip',
                        },
                    ],
                },
            },
        ];
        expectedJsonLd = {
            '@context': {
                'categories.inist': {
                    '@id': 'https://data.istex.fr/ontology/istex#subjectInist',
                    '@type': '@id',
                },
                doi: 'http://purl.org/ontology/bibo/doi',
                'fulltext[0].uri': 'https://data.istex.fr/ontology/istex#accessURL',
            },
            '@graph': [
                {
                    arkIstex: 'ark:/67375/6H6-N49F7FRR-Q',
                    doi: ['10.1006/jmaa.2001.7542'],
                    fulltext: [
                        {
                            extension: 'pdf',
                            mimetype: 'application/pdf',
                            original: true,
                            uri:
                                'https://api.istex.fr/document/9AA9EE9B75A6067C28F8119813504932FFD3D5A1/fulltext/pdf',
                        },
                        {
                            extension: 'zip',
                            mimetype: 'application/zip',
                            original: false,
                            uri:
                                'https://api.istex.fr/document/9AA9EE9B75A6067C28F8119813504932FFD3D5A1/fulltext/zip',
                        },
                    ],
                    '@id': 'https://api.istex.fr/ark:/67375/6H6-N49F7FRR-Q',
                    'categories.inist':
                        'http://localhost:3000/ark:/67375/RZL-F4841DSB-1',
                    'fulltext[0].uri': {
                        '@id':
                            'https://api.istex.fr/document/9AA9EE9B75A6067C28F8119813504932FFD3D5A1/fulltext/pdf',
                    },
                },
            ],
        };
        config = {
            istexQuery: {
                labels: '',
                linked: 'categories.inist',
                context: {
                    'categories.inist': 'https://data.istex.fr/ontology/istex#subjectInist',
                    doi: 'http://purl.org/ontology/bibo/doi',
                    'fulltext[0].uri': 'https://data.istex.fr/ontology/istex#accessURL',
                },
            },
        };
    });

    it('should return nquads from the dataset', (done) => {
        const stream = from(dataTest).pipe(
            ezs('convertToExtendedJsonLd', { config }),
        );
        testOne(
            stream,
            (data) => {
                expect(data).toEqual(expectedJsonLd);
            },
            done,
        );
    });

    it('should expand prefixes', (done) => {
        const stream = from(dataTest)
            .pipe(ezs('convertToExtendedJsonLd', {
                config: {
                    istexQuery: {
                        labels: '',
                        linked: 'categories.inist',
                        context: {
                            'categories.inist': 'fakeistex:subjectInist',
                            doi: 'fakebibo:doi',
                            'fulltext[0].uri': 'fakeistex:accessURL',
                        },
                    },
                },
                prefixes: {
                    fakebibo: 'http://purl.org/ontology/bibo/',
                    fakeistex: 'https://data.istex.fr/ontology/istex#',
                },
            }));
        testOne(
            stream,
            (data) => {
                expect(data).toEqual(expectedJsonLd);
            },
            done,
        );
    });

    it('should error when prefixes are not given', (done) => {
        const stream = from(dataTest)
            .pipe(ezs('convertToExtendedJsonLd', {
                config: {
                    istexQuery: {
                        labels: '',
                        linked: 'categories.inist',
                        context: {
                            'categories.inist': 'istex:subjectInist',
                            doi: 'bibo:doi',
                            'fulltext[0].uri': 'istex:accessURL',
                        },
                    },
                },
                prefixes: {
                    foo: 'bar',
                },
            }));
        const expectedErrorJsonLd = expectedJsonLd;
        expectedErrorJsonLd['@context']['categories.inist']['@id'] = 'undefinedsubjectInist';
        expectedErrorJsonLd['@context'].doi = 'undefineddoi';
        expectedErrorJsonLd['@context']['fulltext[0].uri'] = 'undefinedaccessURL';
        testOne(
            stream,
            (data) => {
                expect(data).toEqual(expectedErrorJsonLd);
            },
            done,
        );
    });

    it('should error when linked is not given', (done) => {
        const stream = from(dataTest)
            .pipe(ezs('convertToExtendedJsonLd', {
                config: {
                    istexQuery: {
                        labels: '',
                        linked: undefined,
                        context: {
                            'categories.inist': 'istex:subjectInist',
                            doi: 'bibo:doi',
                            'fulltext[0].uri': 'istex:accessURL',
                        },
                    },
                },
            }));
        const expectedErrorJsonLd = expectedJsonLd;
        expectedErrorJsonLd['@context']['categories.inist'] = 'https://data.istex.fr/ontology/istex#subjectInist';
        expectedErrorJsonLd['@context'].undefined = { '@id': undefined, '@type': '@id' };
        expectedErrorJsonLd['@graph'][0]['categories.inist'] = undefined;
        expectedErrorJsonLd['@graph'][0].undefined = undefined;
        testOne(
            stream,
            (data) => {
                expect(data).toEqual(expectedErrorJsonLd);
            },
            done,
        );
    });

    it('should error when linked is defined and has no match in context', (done) => {
        const stream = from(dataTest)
            .pipe(ezs('convertToExtendedJsonLd', {
                config: {
                    istexQuery: {
                        labels: '',
                        linked: 'unknown',
                        context: {
                            'categories.inist': 'istex:subjectInist',
                            doi: 'bibo:doi',
                            'fulltext[0].uri': 'istex:accessURL',
                        },
                    },
                },
            }));
        const expectedErrorJsonLd = expectedJsonLd;
        expectedErrorJsonLd['@context']['categories.inist'] = 'https://data.istex.fr/ontology/istex#subjectInist';
        expectedErrorJsonLd['@context'].unknown = { '@id': undefined, '@type': '@id' };
        expectedErrorJsonLd['@graph'][0]['categories.inist'] = undefined;
        expectedErrorJsonLd['@graph'][0].unknown = 'http://localhost:3000/ark:/67375/RZL-F4841DSB-1';
        testOne(
            stream,
            (data) => {
                expect(data).toEqual(expectedErrorJsonLd);
            },
            done,
        );
    });

    it('should use formatData when array', (done) => {
        dataTest[0].content.a = [['a']];
        expectedJsonLd['@graph'][0].a = [['a']];
        expectedJsonLd['@graph'][0]['a[0]'] = ['a'];
        config.istexQuery.context['a[0]'] = 'http://a#';
        expectedJsonLd['@context']['a[0]'] = 'http://a#';
        const stream = from(dataTest)
            .pipe(ezs('convertToExtendedJsonLd', { config }));
        testOne(
            stream,
            (data) => {
                expect(data).toEqual(expectedJsonLd);
            },
            done,
        );
    });
});

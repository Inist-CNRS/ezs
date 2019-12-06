import from from 'from';
import fetch from 'fetch-with-proxy';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);
jest.mock('fetch-with-proxy');

describe('Conditor scroll', () => {
    it('should access to the API', (done) => {
        fetch
            .mockReturnValueOnce({
                json: async () => ({ number: 1 }),
                headers: {
                    _headers: {
                        'x-result-count': '1',
                        'x-total-count': '1',
                        // eslint-disable-next-line max-len
                        'scroll-id': 'DnF1ZXJ5VGhlbkZldGNoBQAAAAADvF-MFklPNnVqLWFQUUZhT0V2bkhyQzVYMlEAAAAABIJ93RYtbU51a2dpcFNoNjMta3lwVlM3cEZBAAAAAASCfdwWLW1OdWtnaXBTaDYzLWt5cFZTN3BGQQAAAAAEwkNgFnE2OWNyRFlIUzdHeUtVLUFNMDNZZWcAAAAAA7xfjRZJTzZ1ai1hUFFGYU9Fdm5IckM1WDJR',
                    },
                },
            });
        from([{ q: '' }])
            .pipe(ezs('conditorScroll', { page_size: 1 }))
            .on('data', (data) => {
                expect(data).toEqual({ number: 1 });
                done();
            });
    });

    it('should get results from the API', (done) => {
        fetch
            .mockReturnValueOnce({
                json: async () => ({ number: 1 }),
                headers: {
                    _headers: {
                        'x-result-count': '1',
                        'x-total-count': '2',
                        // eslint-disable-next-line max-len
                        'scroll-id': 'DnF1ZXJ5VGhlbkZldGNoBQAAAAADvF-MFklPNnVqLWFQUUZhT0V2bkhyQzVYMlEAAAAABIJ93RYtbU51a2dpcFNoNjMta3lwVlM3cEZBAAAAAASCfdwWLW1OdWtnaXBTaDYzLWt5cFZTN3BGQQAAAAAEwkNgFnE2OWNyRFlIUzdHeUtVLUFNMDNZZWcAAAAAA7xfjRZJTzZ1ai1hUFFGYU9Fdm5IckM1WDJR',
                    },
                },
            })
            .mockReturnValueOnce({
                json: async () => ({ number: 2 }),
                headers: {
                    _headers: {
                        'x-result-count': '1',
                        'x-total-count': '2',
                        // eslint-disable-next-line max-len
                        'scroll-id': 'DnF1ZXJ5VGhlbkZldGNoBQAAAAADvF-MFklPNnVqLWFQUUZhT0V2bkhyQzVYMlEAAAAABIJ93RYtbU51a2dpcFNoNjMta3lwVlM3cEZBAAAAAASCfdwWLW1OdWtnaXBTaDYzLWt5cFZTN3BGQQAAAAAEwkNgFnE2OWNyRFlIUzdHeUtVLUFNMDNZZWcAAAAAA7xfjRZJTzZ1ai1hUFFGYU9Fdm5IckM1WDJR',
                    },
                },
            });
        let res = [];
        from([{ q: '' }])
            .pipe(ezs('conditorScroll', { page_size: 1 }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toEqual([{ number: 1 }, { number: 2 }]);
                expect(res.length).toBeGreaterThan(1);
                done();
            });
    });
});

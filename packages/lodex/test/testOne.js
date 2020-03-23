import ezs from '../../core/src';

const testOne = (stream, expectation, done) => {
    stream
        .pipe(ezs.catch())
        .on('data', (data) => {
            try {
                expectation(data);
                done();
            } catch (e) {
                done(e);
            }
        })
        .on('error', done);
};
export default testOne;

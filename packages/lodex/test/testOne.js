const ezs = require('ezs');

const testOne = (stream, expectation, done) => {
    stream.pipe(
        ezs((data) => {
            try {
                expectation(data);
                done();
            } catch (e) {
                done(e);
            }
        }),
    );
};
module.exports = testOne;

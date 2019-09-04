const { defaults } = require('jest-config');

module.exports = {
    ...defaults,
    testMatch: [
        '**/test?(s)/**/*.[jt]s?(x)',
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[tj]s?(x)',
    ],
    testPathIgnorePatterns: ['/node_modules/', 'locals.js'],
    coveragePathIgnorePatterns: ['/node_modules', '/test/']
};

const semver = require('semver');
const { defaults } = require('jest-config');

const options = {
    ...defaults,
    testMatch: [
        '**/test?(s)/**/*.[jt]s?(x)',
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[tj]s?(x)',
    ],
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/',
        'locals.js',
        'testOne.js',
        'testAll.js',
        '/data/',
        '<rootDir>/packages/xslt',
        '<rootDir>/packages/libpostal',
    ],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/lib/', '/lodex/src/reducers/'],
    coverageReporters: ['lcov', 'text-summary'],
    transformIgnorePatterns: [
        '/node_modules/(?!quick-lru)'
    ],
    testTimeout: 8000,
};

if (semver.lt(process.version, '22.0.0')) {
    // lmdb package require node 14 (optional chaining)
    // better-sqlite3 require node 22
    options.testPathIgnorePatterns.push('storage/test');
}

module.exports = options;

const options = {
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
module.exports = options;

const { FlatCompat } = require('@eslint/eslintrc');
const globals = require('globals');

const compat = new FlatCompat({ baseDirectory: __dirname });

module.exports = [
    {
        ignores: [
            '**/node_modules/**',
            '**/coverage/**',
            '**/dist/**',
            '**/lib/**',
        ],
    },
    ...compat.extends('airbnb-base', 'prettier'),
    {
        linterOptions: {
            // Inline disables were written for the legacy ESLint 7 setup.
            reportUnusedDisableDirectives: 'off',
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.mocha,
                ...globals.jest,
                ...globals.node,
            },
        },
        settings: {
            'import/resolver': {
                node: { extensions: ['.js', '.json', '.node'] },
            },
        },
        rules: {
            indent: ['error', 4],
            'max-len': [
                'warn',
                { code: 120, tabWidth: 4, ignoreUrls: true },
            ],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-underscore-dangle': [
                'warn',
                { allow: ['_id', '_error'] },
            ],
            'import/no-extraneous-dependencies': 'off',
            'no-param-reassign': ['error', { props: false }],
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: false }],

            // Both styles are used across packages: relative imports are
            // sometimes suffixed with '.js', sometimes not.
            'import/extensions': 'off',
            'import/no-relative-packages': 'off',
            'import/no-unresolved': ['error', { ignore: ['^@ezs/'] }],

            // The code base is CommonJS; do not strip its 'use strict' headers.
            strict: 'off',

            // Rules added by the Airbnb/plugin upgrades, or widely violated by
            // code predating them. Kept as warnings until that debt is paid.
            'default-param-last': 'off',
            'no-promise-executor-return': 'off',
            'import/no-import-module-exports': 'warn',
            'no-restricted-syntax': 'warn',
            'no-unused-vars': 'warn',
            'consistent-return': 'warn',
            'no-useless-escape': 'warn',
            'no-shadow': 'warn',
            'no-await-in-loop': 'warn',
            'import/no-duplicates': 'warn',
            'no-bitwise': 'warn',
            'no-use-before-define': 'warn',
            'no-return-assign': 'warn',
            'guard-for-in': 'warn',
            'prefer-regex-literals': 'warn',
            eqeqeq: 'warn',
            'array-callback-return': 'warn',
            'global-require': 'warn',
            'no-plusplus': 'warn',
            'import/prefer-default-export': 'warn',
            'func-names': 'warn',
        },
    },
];

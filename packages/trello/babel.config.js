module.exports = {
    presets: [
        [
            '@babel/preset-env', {
                targets: {
                    node: 'current',
                },
                loose: true,
            },
        ],
    ],
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-syntax-import-meta',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-json-strings',
    ],
};

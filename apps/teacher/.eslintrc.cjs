module.exports = {
    extends: ['next/core-web-vitals'],
    root: true,
    parser: '@typescript-eslint/parser',
    rules: {
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
}

module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2022: true,
    },
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'next/core-web-vitals',
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            rules: {
                '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
                '@typescript-eslint/no-explicit-any': 'warn',
            },
        },
    ],
    rules: {
        'no-unused-vars': 'off',
        'react/react-in-jsx-scope': 'off',
    },
}

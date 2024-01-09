module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: '2022',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'warn',
    // Disallow not using braces in one line statements
    curly: 'error',
    // Disallow function body without curly braces
    'arrow-body-style': ['error', 'always'],
    // Disallow async functions which have no await expression
    'require-await': 'error',
    // Disallow the use of function keyword, in order to use arrow syntax
    'prefer-arrow-callback': 'error',
    // Disallow the use of the Function constructor
    'no-restricted-syntax': [
      'error',
      {
        selector: 'FunctionDeclaration', // e.g. "function hello() {...}" is not allowed
        message:
          '"function hello() {...}" is not allowed. Please use arrow syntax instead.',
      },
    ],
  },
}

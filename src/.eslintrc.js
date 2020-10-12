module.exports = {
  env: {
    browser: true,
    es2021: true,
    jquery: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    camelcase: 'warn',
    'no-empty': 'warn',
    'no-var': 'error',
    'standard/no-callback-literal': 'warn'
  }
}

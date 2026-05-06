/* ESLint legacy config (eslint v8). */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: '18.2' } },
  plugins: ['react', 'react-hooks', 'jsx-a11y', 'react-refresh'],
  ignorePatterns: [
    'dist',
    'node_modules',
    'backup_v6_pro_visuals',
    'backup_v6_stable',
    'coverage',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  overrides: [
    {
      // Legacy modules (pre-refactor) — downgrade strict a11y/lint rules to warnings
      // until they get split per FUTURE_PLAN §1.6. New code (src/features, src/lib,
      // src/domain, src/i18n, src/hooks, src/store) MUST keep strict defaults.
      files: ['**/main.jsx', '**/components/**/*.{js,jsx}'],
      rules: {
        'jsx-a11y/click-events-have-key-events': 'warn',
        'jsx-a11y/no-static-element-interactions': 'warn',
        'jsx-a11y/img-redundant-alt': 'warn',
        'react/no-unescaped-entities': 'warn',
      },
    },
    {
      files: ['**/*.test.{js,jsx,ts,tsx}', 'src/test/**'],
      env: { node: true },
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

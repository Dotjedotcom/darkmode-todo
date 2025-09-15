module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
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
  plugins: ['react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    // React 17+ with JSX transform doesn't require React in scope
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['*.config.js', '*.cjs'],
      env: { node: true },
      parserOptions: { sourceType: 'script' },
    },
  ],
};


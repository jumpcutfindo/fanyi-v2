module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/typescript',
  ],
  plugins: ['react-refresh', '@typescript-eslint', 'import'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
      },
    ],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // Main process cannot import from the renderer process
          {
            target: './src/main',
            from: './src/renderer',
          },
          // Renderer process cannot import from the main process
          {
            target: './src/renderer',
            from: './src/main',
          },
        ],
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules', '*.js', '*.cjs', '*.config.ts'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: '.',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {},
    },
  ],
};

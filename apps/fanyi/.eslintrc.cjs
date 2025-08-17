/**
 * Note: If VSCode is not showing some eslint errors as expected, you
 * may need to follow https://stackoverflow.com/a/59856092 to fix
 */

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
  plugins: ['@typescript-eslint', 'import'],
  rules: {
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
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
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

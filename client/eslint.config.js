const reactPlugin = require('eslint-plugin-react');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  {
    ignores: ['**/node_modules/**', '**/dist/**']
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react: reactPlugin
    },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react', '@babel/preset-env']
        },
        ecmaFeatures: {
          jsx: true
        }
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        Buffer: 'readonly'
      }
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];

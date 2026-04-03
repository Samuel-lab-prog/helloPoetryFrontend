import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		ignores: ['dist/**', 'build/**', '.vite/**', 'node_modules/**'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs['recommended-latest'],
			reactRefresh.configs.vite,
			eslintConfigPrettier,
		],
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: globals.browser,
		},
		rules: {
			'@typescript-eslint/no-unused-vars': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			'no-await-in-loop': 'error',
			'no-constructor-return': 'error',
			'no-duplicate-imports': 'error',
			'no-self-compare': 'error',
			'no-unmodified-loop-condition': 'error',
			'no-useless-assignment': 'error',
			'no-eval': 'error',
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',

			'array-callback-return': 'error',
			'default-case': 'error',
			eqeqeq: ['error', 'always'],

			'max-classes-per-file': ['error', 1],
			'max-depth': ['error', 4],
			'max-lines': ['warn', 400],
			'max-lines-per-function': ['error', { max: 300, skipComments: true }],
			'max-nested-callbacks': ['error', 3],
			'max-params': ['error', 4],

			'require-await': 'warn',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'no-unused-vars': 'off',
			'no-undef': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'arrow-body-style': ['error', 'as-needed'],
		},
	},
]);

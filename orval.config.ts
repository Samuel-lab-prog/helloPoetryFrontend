import { defineConfig } from 'orval';

export default defineConfig({
	api: {
		input: './api.json',
		output: {
			client: 'react-query',
			mode: 'split',
			clean: true,
			prettier: true,
			target: './src/core/api/generated/index.ts',
			schemas: './src/core/api/generated/schemas',
		},
	},
});

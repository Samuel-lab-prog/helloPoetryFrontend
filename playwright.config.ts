import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const CI = false;

export default defineConfig({
	testDir: './e2e',
	timeout: 60_000,
	expect: {
		timeout: 10_000,
	},
	use: {
		baseURL: BASE_URL,
		trace: 'retain-on-failure',
	},
	webServer: {
		command: `bun run build && bun run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
		url: BASE_URL,
		timeout: 120_000,
		reuseExistingServer: !CI,
	},
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
			},
		},
	],
});

import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const FRONTEND_URL = 'http://127.0.0.1:4174';
const BACKEND_URL = 'http://127.0.0.1:5101';
const BACKEND_DIR = '../backend';
const TEST_DATABASE_URL =
	'postgresql://hello_poetry_e2e:hello_poetry_e2e_only@127.0.0.1:55432/hello_poetry_e2e_test?schema=public';

const projectName = process.env.HELLO_POETRY_E2E_PROJECT;
if (!projectName || !/^hello-poetry-e2e-\d+-[a-f0-9]{12}$/.test(projectName)) {
	throw new Error(
		'Use `bun run test:e2e:integrated` to start the isolated E2E environment safely.',
	);
}

const e2eTempRoot = process.env.HELLO_POETRY_E2E_TEMP_ROOT;
const expectedTempRoot = resolve(tmpdir(), projectName);
if (!e2eTempRoot || !isAbsolute(e2eTempRoot) || resolve(e2eTempRoot) !== expectedTempRoot) {
	throw new Error(
		'Integrated E2E artifacts must use the unique run directory under the OS temp directory.',
	);
}
const artifactMarker = join(expectedTempRoot, '.hello-poetry-integrated-e2e-owner');
if (!existsSync(artifactMarker) || readFileSync(artifactMarker, 'utf8') !== projectName) {
	throw new Error(`Integrated E2E artifact ownership is not proven for ${expectedTempRoot}.`);
}

const frontendBuildDir = join(expectedTempRoot, 'frontend-dist');

const backendEnv = {
	...process.env,
	NODE_ENV: 'test',
	DATABASE_URL: TEST_DATABASE_URL,
	PORT: '5101',
	JWT_SECRET_KEY: 'hello-poetry-integrated-e2e-only-secret',
	JWT_ISSUER: BACKEND_URL,
	JWT_AUDIENCE: BACKEND_URL,
	FRONTEND_URL,
	CORS_ORIGIN: FRONTEND_URL,
	CSRF_ENABLED: 'true',
	CSRF_ORIGIN_ALLOWLIST: FRONTEND_URL,
	CROSS_SITE_COOKIES: 'false',
};

export default defineConfig({
	outputDir: join(expectedTempRoot, 'playwright-results'),
	testDir: './e2e/integrated',
	testMatch: '**/*.spec.ts',
	fullyParallel: false,
	workers: 1,
	timeout: 90_000,
	expect: { timeout: 10_000 },
	use: {
		...devices['Desktop Chrome'],
		baseURL: FRONTEND_URL,
		headless: true,
		trace: 'retain-on-failure',
	},
	webServer: [
		{
			command: 'bun src/Server.ts',
			cwd: BACKEND_DIR,
			url: `${BACKEND_URL}/api/v1/users/check-email?email=e2e-readiness%40hello-poetry.test`,
			name: 'Hello Poetry API (isolated E2E database)',
			env: backendEnv,
			timeout: 120_000,
			reuseExistingServer: false,
		},
		{
			command: `bunx vite build --outDir "${frontendBuildDir}" && bunx vite preview --outDir "${frontendBuildDir}" --host 127.0.0.1 --port 4174 --strictPort`,
			url: FRONTEND_URL,
			name: 'Hello Poetry frontend (integrated E2E)',
			env: {
				...process.env,
				VITE_API_URL: `${BACKEND_URL}/api/v1`,
			},
			timeout: 120_000,
			reuseExistingServer: false,
		},
	],
});

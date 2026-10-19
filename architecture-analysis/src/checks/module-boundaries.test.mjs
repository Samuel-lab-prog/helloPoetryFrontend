import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { classifyCoreFeatureViolations } from './module-boundaries.mjs';

const require = createRequire(import.meta.url);
const config = require('../../../.dependency-cruiser.cjs');

function matches(pattern, value) {
	return (Array.isArray(pattern) ? pattern : [pattern]).some((item) =>
		new RegExp(item).test(value),
	);
}

function applies(filter = {}, file) {
	return (
		(!filter.path || matches(filter.path, file)) &&
		(!filter.pathNot || !matches(filter.pathNot, file))
	);
}

function matchingRules(from, to) {
	return config.forbidden
		.filter((rule) => rule.from?.path && rule.to?.path)
		.filter((rule) => applies(rule.from, from) && applies(rule.to, to))
		.map((rule) => rule.name);
}

test('core to feature imports are blocked even when the feature path is public', () => {
	assert.equal(
		config.forbidden.find((rule) => rule.name === 'core-is-independent').severity,
		'error',
	);
	assert.ok(
		matchingRules('src/core/http/client.ts', 'src/features/auth/public/index.ts').includes(
			'core-is-independent',
		),
	);
});

test('cross-feature public paths are allowed while private paths are blocked', () => {
	assert.deepEqual(
		matchingRules(
			'src/features/users/use-cases/profile/Page.tsx',
			'src/features/auth/public/index.ts',
		),
		[],
	);
	assert.ok(
		matchingRules(
			'src/features/users/use-cases/profile/Page.tsx',
			'src/features/auth/use-cases/login/Page.tsx',
		).some((name) => name.startsWith('cross-feature-users-to-auth-')),
	);
	assert.deepEqual(
		matchingRules(
			'src/features/users/use-cases/profile/Page.tsx',
			'src/features/users/internal/auth.ts',
		),
		[],
	);
});

test('core and features cannot depend on app composition', () => {
	assert.equal(
		config.forbidden.find((rule) => rule.name === 'features-do-not-import-app-composition')
			.severity,
		'error',
	);
	assert.ok(
		matchingRules('src/features/users/use-cases/profile/Page.tsx', 'src/app/App.tsx').includes(
			'features-do-not-import-app-composition',
		),
	);
	assert.ok(
		matchingRules('src/core/api/client.ts', 'src/app/App.tsx').includes('core-is-independent'),
	);
});

test('app composes feature public APIs, route pages and bootstrap adapters only', () => {
	assert.deepEqual(
		matchingRules('src/app/routes/router.tsx', 'src/features/auth/public/index.ts'),
		[],
	);
	assert.deepEqual(
		matchingRules('src/app/routes/router.tsx', 'src/features/auth/use-cases/login/Page.tsx'),
		[],
	);
	assert.deepEqual(
		matchingRules(
			'src/app/bootstrap/registerApplicationDependencies.ts',
			'src/features/auth/adapters/authSessionPort.ts',
		),
		[],
	);
	assert.ok(
		matchingRules(
			'src/app/routes/router.tsx',
			'src/features/auth/use-cases/login/hooks/useLogin.ts',
		).includes('app-uses-feature-entrypoints'),
	);
	assert.ok(
		matchingRules(
			'src/app/routes/router.tsx',
			'src/features/auth/adapters/authSessionPort.ts',
		).includes('only-bootstrap-imports-feature-adapters'),
	);
});

test('test support is available to tests but blocked from production modules', () => {
	assert.ok(
		matchingRules(
			'src/features/poems/use-cases/list/usePoems.ts',
			'src/test-support/authClientStore.ts',
		).includes('test-support-is-private-to-tests'),
	);
	assert.deepEqual(
		matchingRules(
			'src/features/poems/use-cases/list/tests/usePoems.test.tsx',
			'src/test-support/authClientStore.ts',
		),
		[],
	);
});

test('only exact documented legacy core edges are grandfathered', () => {
	const edge = {
		from: 'src/core/legacy/example.ts',
		to: 'src/features/auth/public/example.ts',
		reason: 'Synthetic fixture for exact-edge policy testing.',
	};
	const knownViolation = {
		from: edge.from,
		to: edge.to,
		rule: { name: 'core-is-independent', severity: 'error' },
	};
	const result = classifyCoreFeatureViolations([knownViolation], [edge]);
	assert.equal(result.knownLegacy.length, 1);
	assert.deepEqual(result.blocking, []);
	assert.deepEqual(result.staleLegacy, []);

	const newEdge = { ...knownViolation, to: 'src/features/auth/public/newModule.ts' };
	const unapproved = classifyCoreFeatureViolations([newEdge], [edge]);
	assert.deepEqual(unapproved.knownLegacy, []);
	assert.deepEqual(unapproved.blocking, [newEdge]);
	assert.deepEqual(unapproved.staleLegacy, [edge]);
});

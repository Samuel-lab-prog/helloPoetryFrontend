import assert from 'node:assert/strict';
import test from 'node:test';
import { getArchitectureExitCode, validateDependencyCruiserResult } from './check-dependencies.mjs';

test('rejects an empty graph instead of reporting a false success', () => {
	assert.throws(
		() => validateDependencyCruiserResult({ modules: [], summary: { violations: [] } }),
		/zero relevant TypeScript source modules/,
	);
});

test('rejects an incomplete dependency-cruiser summary', () => {
	assert.throws(
		() => validateDependencyCruiserResult({ modules: [{ source: 'src/App.tsx' }] }),
		/incomplete analysis summary/,
	);
});

test('counts source modules and preserves warning severity', () => {
	const report = validateDependencyCruiserResult({
		modules: [{ source: 'src/App.tsx' }, { source: 'node_modules/pkg/index.js' }],
		summary: {
			totalCruised: 1,
			totalDependenciesCruised: 1,
			error: 0,
			warn: 1,
			violations: [
				{ rule: { severity: 'warn', name: 'no-circular' }, from: 'src/a.ts', to: 'src/b.ts' },
			],
		},
	});

	assert.equal(report.analyzedModules, 1);
	assert.equal(report.errors.length, 0);
	assert.equal(report.warnings.length, 1);
});

test('keeps error findings blocking', () => {
	const report = validateDependencyCruiserResult({
		modules: [{ source: 'src/App.tsx' }],
		summary: {
			totalCruised: 1,
			totalDependenciesCruised: 1,
			error: 1,
			warn: 0,
			violations: [{ rule: { severity: 'error', name: 'not-to-unresolvable' } }],
		},
	});

	assert.equal(report.errors.length, 1);
	assert.equal(getArchitectureExitCode(0, report), 1);
});

test('has no grandfathered core dependencies and blocks any new core-to-feature edge', () => {
	const report = validateDependencyCruiserResult({
		modules: [{ source: 'src/App.tsx' }],
		summary: {
			totalCruised: 1,
			totalDependenciesCruised: 1,
			error: 0,
			warn: 0,
			violations: [],
		},
	});
	assert.equal(report.corePolicy.knownLegacy.length, 0);
	assert.equal(report.corePolicy.blocking.length, 0);
	assert.equal(getArchitectureExitCode(0, report), 0);

	const newEdge = validateDependencyCruiserResult({
		modules: [{ source: 'src/App.tsx' }],
		summary: {
			totalCruised: 1,
			totalDependenciesCruised: 1,
			error: 1,
			warn: 0,
			violations: [
				{
					from: 'src/core/example.ts',
					to: 'src/features/auth/public/example.ts',
					rule: { severity: 'error', name: 'core-is-independent' },
				},
			],
		},
	});
	assert.equal(newEdge.corePolicy.blocking.length, 1);
	assert.equal(getArchitectureExitCode(0, newEdge), 1);
});

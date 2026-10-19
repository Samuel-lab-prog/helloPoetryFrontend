import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { classifyCoreFeatureViolations } from '../architecture-analysis/src/checks/module-boundaries.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(
	projectRoot,
	'node_modules/dependency-cruiser/bin/dependency-cruiser.mjs',
);
const sourceModule = /^src\/.*\.(?:ts|tsx)$/;
const legacyCoreDependencies = JSON.parse(
	readFileSync(
		path.join(
			projectRoot,
			'architecture-analysis/src/checks/legacy-core-feature-dependencies.json',
		),
		'utf8',
	),
);

export function validateDependencyCruiserResult(result) {
	if (!Array.isArray(result?.modules)) {
		throw new Error('dependency-cruiser returned no modules array.');
	}

	const analyzedModules = result.modules.filter((module) => sourceModule.test(module.source ?? ''));
	if (analyzedModules.length === 0) {
		throw new Error('dependency-cruiser analyzed zero relevant TypeScript source modules.');
	}
	if (
		!Number.isInteger(result.summary?.totalCruised) ||
		result.summary.totalCruised < analyzedModules.length ||
		!Number.isInteger(result.summary?.totalDependenciesCruised) ||
		!Array.isArray(result.summary?.violations)
	) {
		throw new Error('dependency-cruiser returned an incomplete analysis summary.');
	}

	const violations = result.summary.violations;
	const errors = violations.filter((violation) => violation.rule?.severity === 'error');
	const warnings = violations.filter((violation) => violation.rule?.severity === 'warn');
	if (result.summary.error !== errors.length || result.summary.warn !== warnings.length) {
		throw new Error('dependency-cruiser summary counts do not match the violation list.');
	}
	const corePolicy = classifyCoreFeatureViolations(errors, legacyCoreDependencies);

	return { analyzedModules: analyzedModules.length, violations, errors, warnings, corePolicy };
}

export function getArchitectureExitCode(executionStatus, report) {
	const blockingErrors = report.corePolicy.blocking.filter(
		(violation) => violation.rule?.severity === 'error',
	);
	const expectedLegacyOnlyFailure =
		report.errors.length > 0 &&
		report.errors.length === report.corePolicy.knownLegacy.length &&
		blockingErrors.length === 0 &&
		report.corePolicy.staleLegacy.length === 0;
	const blockedCount = blockingErrors.length + report.corePolicy.staleLegacy.length;

	return (executionStatus !== 0 && !expectedLegacyOnlyFailure) || blockedCount > 0 ? 1 : 0;
}

function main() {
	const execution = spawnSync(
		process.execPath,
		[
			cliPath,
			'src/**/*.{ts,tsx}',
			'--exclude',
			'node_modules|dist|coverage',
			'--output-type',
			'json',
		],
		{ cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
	);

	if (execution.error) {
		console.error(execution.error.message);
		process.exitCode = 1;
		return;
	}

	let result;
	try {
		result = JSON.parse(execution.stdout);
	} catch {
		console.error('Could not parse dependency-cruiser JSON output.');
		if (execution.stderr) console.error(execution.stderr.trim());
		process.exitCode = 1;
		return;
	}

	let report;
	try {
		report = validateDependencyCruiserResult(result);
	} catch (error) {
		console.error(error.message);
		process.exitCode = 1;
		return;
	}

	console.log(`dependency-cruiser analyzed ${report.analyzedModules} TypeScript source modules.`);
	for (const violation of report.violations) {
		const { severity, name } = violation.rule;
		const legacy = report.corePolicy.knownLegacy.find((entry) => entry.violation === violation);
		if (legacy) {
			console.warn(`[legacy] ${name}: ${violation.from} -> ${violation.to} (${legacy.reason})`);
		} else {
			console.log(`[${severity}] ${name}: ${violation.from} -> ${violation.to}`);
		}
	}
	for (const stale of report.corePolicy.staleLegacy) {
		console.error(`[stale legacy exception] ${stale.from} -> ${stale.to}`);
	}
	const blockedCount =
		report.corePolicy.blocking.filter((violation) => violation.rule?.severity === 'error').length +
		report.corePolicy.staleLegacy.length;
	console.log(
		`Architecture findings: ${blockedCount} blocking error(s), ${report.warnings.length + report.corePolicy.knownLegacy.length} warning(s), ${report.corePolicy.knownLegacy.length} exact legacy edge(s).`,
	);

	process.exitCode = getArchitectureExitCode(execution.status, report);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

import { red, green, yellow } from 'kleur/colors';
import type { DepcruiseResult } from '../../Types';
import { printRulesTable, type TableColumn } from '../../PrintTable';
import path from 'path';
import { extractDomainFromPath, isGenericSubdomain } from '../../Utils';

type Violation = {
	from: string;
	to: string;
	fromDomain: string;
	toDomain: string;
};

const ALLOWED_CROSS_DOMAIN_REGEX = /\/public(\/|$)/;

function checkDomainNamespaceIntegrity(cruiseResult: DepcruiseResult): Violation[] {
	const violations: Violation[] = [];

	for (const module of cruiseResult.modules) {
		const from = module.source;
		const fromDomain = extractDomainFromPath(from);
		if (!fromDomain) continue;

		for (const dep of module.dependencies ?? []) {
			const to = dep.resolved;
			if (!to) continue;

			const resolvedPath = normalizeResolved(module.source, to);
			if (isGenericSubdomain(resolvedPath)) continue;
			if (!resolvedPath.startsWith('src/features/')) continue;

			const toDomain = extractDomainFromPath(resolvedPath);
			if (!toDomain) continue;
			if (toDomain === fromDomain) continue;
			if (ALLOWED_CROSS_DOMAIN_REGEX.test(resolvedPath)) continue;

			violations.push({
				from,
				to: resolvedPath,
				fromDomain,
				toDomain,
			});
		}
	}

	return violations;
}

export function printNoCrossDomainCalls(cruiseResult: DepcruiseResult): void {
	const violations = checkDomainNamespaceIntegrity(cruiseResult);

	if (violations.length === 0) {
		console.log(green('✔ Rules: No cross-domain violations found'));
		return;
	}

	const columns: TableColumn<Violation>[] = [
		{
			header: 'FROM MODULE',
			width: 80,
			render: (v) => ({
				text: v.from,
			}),
		},
		{
			header: 'TO MODULE',
			width: 80,
			render: (v) => ({
				text: v.to,
			}),
		},
	];

	printRulesTable(`Cross-domain violations (${violations.length})`, columns, violations);
}

function normalizeResolved(moduleSource: string, resolved: string): string {
	const normalized = resolved.replace(/\\/g, '/');

	if (normalized.startsWith('@root/')) return `src/${normalized.slice('@root/'.length)}`;
	if (normalized.startsWith('@features/'))
		return `src/features/${normalized.slice('@features/'.length)}`;
	if (normalized.startsWith('@core/')) return `src/core/${normalized.slice('@core/'.length)}`;
	if (normalized.startsWith('@BaseComponents')) return 'src/core/components/index.ts';
	if (normalized.startsWith('@Utils')) return 'src/core/utils/index.ts';

	if (normalized.startsWith('.') || normalized.startsWith('..')) {
		const baseDir = path.posix.dirname(moduleSource.replace(/\\/g, '/'));
		return path.posix.normalize(path.posix.join(baseDir, normalized));
	}

	return normalized;
}

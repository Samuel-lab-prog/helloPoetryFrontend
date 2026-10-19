export function classifyCoreFeatureViolations(violations, legacyDependencies) {
	const legacyByEdge = new Map(
		legacyDependencies.map((entry) => [`${entry.from}\0${entry.to}`, entry]),
	);
	const observedLegacyEdges = new Set();
	const knownLegacy = [];
	const blocking = [];

	for (const violation of violations) {
		const edge = `${violation.from}\0${violation.to}`;
		const legacy =
			violation.rule?.name === 'core-is-independent' ? legacyByEdge.get(edge) : undefined;

		if (legacy) {
			knownLegacy.push({ violation, reason: legacy.reason });
			observedLegacyEdges.add(edge);
		} else {
			blocking.push(violation);
		}
	}

	const staleLegacy = legacyDependencies.filter(
		(entry) => !observedLegacyEdges.has(`${entry.from}\0${entry.to}`),
	);

	return { knownLegacy, blocking, staleLegacy };
}

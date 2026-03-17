type SanitizeConfig = {
	maxTags: number;
	maxTagLength?: number;
};

export function sanitizeTags(rawTags: string[], { maxTags, maxTagLength }: SanitizeConfig) {
	const seen = new Set<string>();
	const normalized: string[] = [];

	for (const rawTag of rawTags) {
		const trimmed = rawTag.trim();
		if (!trimmed) continue;

		const normalizedTag = maxTagLength ? trimmed.slice(0, maxTagLength) : trimmed;
		if (!normalizedTag) continue;

		const dedupeKey = normalizedTag.toLocaleLowerCase();
		if (seen.has(dedupeKey)) continue;

		seen.add(dedupeKey);
		normalized.push(normalizedTag);

		if (normalized.length >= maxTags) break;
	}

	return normalized;
}

export function resolveErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;

	if (typeof error === 'string') return error;

	if (typeof error === 'object') {
		const candidate = (error as { message?: unknown }).message;
		if (typeof candidate === 'string') return candidate;
	}

	if (Array.isArray(error)) {
		for (const item of error) {
			const nested = resolveErrorMessage(item);
			if (nested) return nested;
		}
		return undefined;
	}

	if (typeof error === 'object') {
		for (const value of Object.values(error as Record<string, unknown>)) {
			const nested = resolveErrorMessage(value);
			if (nested) return nested;
		}
	}

	return undefined;
}

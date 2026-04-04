import { describe, expect, it } from 'vitest';

import { findForbiddenWords, FORBIDDEN_WORDS } from './forbiddenWordsUtils';

describe('forbiddenWordsUtils', () => {
	it('detects exact forbidden words', () => {
		const result = findForbiddenWords('isso e bosta');

		expect(result).toContain('bosta');
	});

	it('normalizes accents, leet, and casing', () => {
		const result = findForbiddenWords('B0$TA CÁRAI');

		expect(result).toContain('bosta');
		expect(result).toContain('carai');
	});

	it('collapses repeated letters', () => {
		const result = findForbiddenWords('caraiii bosta');

		expect(result).toContain('carai');
	});

	it('returns empty list when no forbidden words are found', () => {
		expect(findForbiddenWords('texto limpo')).toEqual([]);
	});

	it('only returns words that are actually forbidden', () => {
		const result = findForbiddenWords('hitler carai alou');

		result.forEach((word) => {
			expect(FORBIDDEN_WORDS).toContain(word);
		});
	});
});

import { describe, expect, it } from 'vitest';

import { translateModerationStatus, translateVisibility } from './translate';

describe('translateVisibility', () => {
	it('maps known visibility values', () => {
		expect(translateVisibility('public')).toBe('Public');
		expect(translateVisibility('private')).toBe('Private');
		expect(translateVisibility('unlisted')).toBe('Unlisted');
	});

	it('falls back to raw value for unknown visibility', () => {
		expect(translateVisibility('custom' as never)).toBe('custom');
	});
});

describe('translateModerationStatus', () => {
	it('maps known moderation status values', () => {
		expect(translateModerationStatus('approved')).toBe('Approved');
		expect(translateModerationStatus('rejected')).toBe('Rejected');
		expect(translateModerationStatus('pending')).toBe('Pending');
		expect(translateModerationStatus('removed')).toBe('Removed');
	});

	it('falls back to raw value for unknown status', () => {
		expect(translateModerationStatus('custom' as never)).toBe('custom');
	});
});

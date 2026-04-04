import { formatDate, formatRelativeTime } from './dateFormat';

describe('UTIL - Date Format', () => {
	describe('formatDate', () => {
		it('returns "Invalid date" for invalid input', () => {
			expect(formatDate('not-a-date')).toBe('Invalid date');
		});

		it('formats a valid date with stable options', () => {
			const date = new Date('2025-01-01T13:45:00.000Z');
			const value = formatDate(
				date,
				{ timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' },
				'en-US',
			);

			expect(value).toContain('1/1/25');
			expect(value).toContain('1:45');
		});
	});

	describe('formatRelativeTime', () => {
		const realNow = Date.now;

		afterEach(() => {
			Date.now = realNow;
		});

		it('returns empty string when input is missing', () => {
			expect(formatRelativeTime()).toBe('');
		});

		it('returns "now" for future dates', () => {
			Date.now = () => new Date('2025-01-01T00:00:00.000Z').getTime();

			expect(formatRelativeTime('2025-01-01T00:00:30.000Z')).toBe('now');
		});

		it('returns minutes, hours, days, months, and years', () => {
			Date.now = () => new Date('2025-01-01T00:00:00.000Z').getTime();

			expect(formatRelativeTime('2024-12-31T23:55:00.000Z')).toBe('5m ago');
			expect(formatRelativeTime('2024-12-31T22:00:00.000Z')).toBe('2h ago');
			expect(formatRelativeTime('2024-12-29T00:00:00.000Z')).toBe('3d ago');
			expect(formatRelativeTime('2024-11-01T00:00:00.000Z')).toBe('2mo ago');
			expect(formatRelativeTime('2024-01-01T00:00:00.000Z')).toBe('1a ago');
		});
	});
});

// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PoemCard } from '../PoemCard';
import { poemPreview, poemPreviewWithoutStats } from './fixtures';

vi.mock('@features/moderation/public', () => ({
	ModerationActionsMenu: ({ ariaLabel }: { ariaLabel?: string }) => (
		<button type='button' aria-label={ariaLabel}>
			Moderation actions
		</button>
	),
}));

describe('FEATURE COMPONENT - Poems - PoemCard', () => {
	it('renders poem content, links, stats, tags, and moderation action', () => {
		renderWithProviders(<PoemCard poem={poemPreview} />);

		expect(screen.getByText('Poem')).toBeTruthy();
		expect(screen.getByRole('link', { name: /A river remembers/ }).getAttribute('href')).toBe(
			'/poems/a-river-remembers/44',
		);
		expect(screen.getByText('A short poem about memory and water.')).toBeTruthy();
		expect(screen.getByRole('link', { name: /Ada River/ }).getAttribute('href')).toBe(
			'/authors/12',
		);
		expect(screen.getByText('@adariver')).toBeTruthy();
		expect(screen.getByText('7')).toBeTruthy();
		expect(screen.getByText('3')).toBeTruthy();
		expect(screen.getByText('#memory')).toBeTruthy();
		expect(screen.getByText('#water')).toBeTruthy();
		expect(screen.getByText('#quiet')).toBeTruthy();
		expect(screen.getByText('#night')).toBeTruthy();
		expect(screen.queryByText('#hidden')).toBeNull();
		expect(screen.getByRole('button', { name: 'Open poem moderation actions' })).toBeTruthy();
	});

	it('falls back to top-level count fields when stats are absent', () => {
		renderWithProviders(<PoemCard poem={poemPreviewWithoutStats} />);

		expect(screen.getByText('4')).toBeTruthy();
		expect(screen.getByText('9')).toBeTruthy();
	});

	it('can hide author metadata', () => {
		renderWithProviders(<PoemCard poem={poemPreview} hideAuthorMeta />);

		expect(screen.queryByRole('link', { name: /Ada River/ })).toBeNull();
		expect(screen.queryByText('@adariver')).toBeNull();
		expect(screen.getByRole('link', { name: /A river remembers/ })).toBeTruthy();
	});

	it('renders the flat variant without the card badge', () => {
		renderWithProviders(<PoemCard poem={poemPreview} variant='flat' />);

		expect(screen.getByRole('link', { name: /A river remembers/ }).getAttribute('href')).toBe(
			'/poems/a-river-remembers/44',
		);
		expect(screen.queryByText('Poem')).toBeNull();
		expect(screen.getByRole('button', { name: 'Open poem moderation actions' })).toBeTruthy();
	});
});

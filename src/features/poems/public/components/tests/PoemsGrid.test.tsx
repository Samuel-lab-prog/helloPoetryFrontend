// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PoemsGrid } from '../PoemsGrid';
import { poemPreview } from './fixtures';

vi.mock('@features/moderation/public', () => ({
	ModerationActionsMenu: ({ ariaLabel }: { ariaLabel?: string }) => (
		<button type='button' aria-label={ariaLabel}>
			Moderation actions
		</button>
	),
}));

describe('FEATURE COMPONENT - Poems - PoemsGrid', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders the loading state before empty content', () => {
		renderWithProviders(<PoemsGrid poems={[]} isLoading isError={false} />);

		expect(screen.getByText('Loading...')).toBeTruthy();
		expect(screen.queryByText('No data found.')).toBeNull();
	});

	it('renders the empty state when there are no poems after loading', () => {
		renderWithProviders(<PoemsGrid poems={[]} isLoading={false} isError={false} />);

		expect(screen.getByText('No data found.')).toBeTruthy();
	});

	it('renders the error state before loading or poem content', () => {
		renderWithProviders(<PoemsGrid poems={[poemPreview]} isLoading isError />);

		expect(screen.getByRole('alert')).toBeTruthy();
		expect(screen.getByText('POEMS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('We could not load poems right now.')).toBeTruthy();
		expect(
			screen.getByText(
				'Nothing was lost. Please try again in a moment, or refresh the page to reconnect.',
			),
		).toBeTruthy();
		expect(screen.queryByText('A river remembers')).toBeNull();
		expect(screen.queryByText('Loading...')).toBeNull();
	});

	it('reloads the page from the error recovery action', () => {
		const reload = vi.spyOn(window.location, 'reload').mockImplementation(() => undefined);

		renderWithProviders(<PoemsGrid poems={[]} isLoading={false} isError />);

		fireEvent.click(screen.getByRole('button', { name: 'Refresh poems' }));

		expect(reload).toHaveBeenCalledTimes(1);
	});

	it('renders poem cards when content is available', () => {
		renderWithProviders(<PoemsGrid poems={[poemPreview]} isLoading={false} isError={false} />);

		expect(screen.getByRole('link', { name: /A river remembers/ }).getAttribute('href')).toBe(
			'/poems/a-river-remembers/44',
		);
		expect(screen.queryByText('No data found.')).toBeNull();
		expect(screen.queryByText('Loading...')).toBeNull();
		expect(screen.queryByRole('alert')).toBeNull();
	});
});

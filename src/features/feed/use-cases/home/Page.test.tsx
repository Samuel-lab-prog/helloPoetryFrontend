// @vitest-environment happy-dom
import type {
	PaginatedPoemsType,
	PoemPreviewType,
	SearchPoemsParams,
} from '@features/poems/public/types';
import { registerPoemsQueryPort } from '@root/core/ports/poems';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { clearTestAuthClient } from '@root/test-support/authClientStore';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HomePage } from './Page';

const poem: PoemPreviewType = {
	id: 11,
	title: 'River poem',
	slug: 'river-poem',
	excerpt: 'A poem about a river',
	createdAt: '2026-01-01T00:00:00.000Z',
	tags: [
		{ id: 1, name: 'nature' },
		{ id: 2, name: 'water' },
	],
	author: { id: 2, name: 'Poet', nickname: 'poet', avatarUrl: null },
};

function LocationSearch() {
	const location = useLocation();
	return <output data-testid='location-search'>{location.search}</output>;
}

function makePage(
	poems: PoemPreviewType[],
	options: Partial<PaginatedPoemsType> = {},
): PaginatedPoemsType {
	return { poems, hasMore: false, nextCursor: null, ...options };
}

function setup({
	route = '/',
	searchResult = makePage([poem]),
	recentResult = makePage([]),
	searchQueryFn,
}: {
	route?: string;
	searchResult?: PaginatedPoemsType;
	recentResult?: PaginatedPoemsType;
	searchQueryFn?: (params: SearchPoemsParams) => Promise<PaginatedPoemsType>;
} = {}) {
	const getRecentPoems = vi.fn(() => Promise.resolve(recentResult));
	const getSearchQueryOptions = vi.fn((params: SearchPoemsParams) => ({
		queryKey: ['poems', 'search-test', params],
		queryFn: () => (searchQueryFn ? searchQueryFn(params) : Promise.resolve(searchResult)),
	}));
	registerPoemsQueryPort({ getRecentPoems, getSearchQueryOptions });
	const view = renderWithProviders(
		<>
			<HomePage />
			<LocationSearch />
		</>,
		{ route },
	);
	return { ...view, getRecentPoems, getSearchQueryOptions };
}

describe('FEATURE PAGE - Feed - poem discovery', () => {
	beforeEach(() => {
		clearTestAuthClient();
	});

	it('preserves the existing feed when no discovery filters are active', async () => {
		const recentPoem = { ...poem, id: 20, title: 'Recent poem', tags: [] };
		const getRecentPoems = vi.fn(() => Promise.resolve(makePage([recentPoem])));
		registerPoemsQueryPort({
			getRecentPoems,
			getSearchQueryOptions: () => ({
				queryKey: ['search'],
				queryFn: () => Promise.resolve(makePage([])),
			}),
		});

		renderWithProviders(<HomePage />);

		expect(await screen.findByText('Recent poem')).toBeTruthy();
		expect(getRecentPoems).toHaveBeenCalled();
	});

	it('restores title, tags, and sort from the URL and sends the combined filters', async () => {
		const { getSearchQueryOptions } = setup({
			route: '/?q=river&tag=nature&tag=water&order=title:asc',
		});

		expect(await screen.findByText('River poem')).toBeTruthy();
		expect(screen.getByLabelText('Search poems')).toHaveProperty('value', 'river');
		expect(screen.getByLabelText('Search poems')).toHaveProperty('maxLength', 120);
		expect(screen.getByLabelText('Sort results')).toHaveProperty('value', 'title:asc');
		await waitFor(() =>
			expect(getSearchQueryOptions).toHaveBeenCalledWith(
				expect.objectContaining({
					searchTitle: 'river',
					tags: ['nature', 'water'],
					orderBy: 'title',
					orderDirection: 'asc',
				}),
			),
		);
	});

	it('searches by title after the input debounce and changes to supported sorting', async () => {
		const { getSearchQueryOptions } = setup();
		fireEvent.change(screen.getByLabelText('Search poems'), { target: { value: 'river' } });

		await waitFor(() =>
			expect(getSearchQueryOptions).toHaveBeenCalledWith(
				expect.objectContaining({ searchTitle: 'river' }),
			),
		);
		expect(screen.getByTestId('location-search').textContent).toContain('q=river');
		fireEvent.change(screen.getByLabelText('Sort results'), { target: { value: 'title:desc' } });
		await waitFor(() =>
			expect(getSearchQueryOptions).toHaveBeenCalledWith(
				expect.objectContaining({ orderBy: 'title', orderDirection: 'desc' }),
			),
		);
	});

	it('adds up to five tags, removes one filter, and clears the remaining filters', () => {
		setup({ route: '/?source=profile' });
		const tagInput = screen.getByLabelText('Tags (up to 5)');
		for (const tag of ['one', 'two', 'three', 'four', 'five']) {
			fireEvent.change(tagInput, { target: { value: tag } });
			fireEvent.click(screen.getByRole('button', { name: 'Add tag' }));
		}

		expect(screen.getByLabelText('Tags (up to 5)')).toHaveProperty('disabled', true);
		expect(screen.getByTestId('location-search').textContent).toContain('tag=one');
		expect(screen.getByTestId('location-search').textContent).toContain('tag=five');
		fireEvent.click(screen.getByRole('button', { name: 'Remove tag two' }));
		expect(screen.getByTestId('location-search').textContent).not.toContain('tag=two');
		fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
		expect(screen.getByTestId('location-search').textContent).toBe('?source=profile');
	});

	it('keeps a new title search typed immediately after clearing filters', () => {
		setup({ route: '/?q=previous' });
		const searchInput = screen.getByLabelText('Search poems');

		act(() => {
			fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
			fireEvent.change(searchInput, { target: { value: 'new title' } });
		});

		expect(searchInput).toHaveProperty('value', 'new title');
	});

	it('keeps every URL filter cleared after the title debounce settles', async () => {
		vi.useFakeTimers();
		try {
			setup({ route: '/?q=river&tag=nature&order=title:asc' });
			fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
			await act(() => vi.advanceTimersByTimeAsync(200));

			expect(screen.getByTestId('location-search').textContent).not.toMatch(/[?&](q|tag|order)=/);
		} finally {
			vi.useRealTimers();
		}
	});

	it('removes title and sort filters independently while retaining the tag filter', () => {
		setup({ route: '/?q=river&tag=nature&order=title:asc' });
		fireEvent.click(screen.getByRole('button', { name: 'Remove title filter' }));
		expect(screen.getByTestId('location-search').textContent).not.toContain('q=');
		expect(screen.getByTestId('location-search').textContent).toContain('tag=nature');
		expect(screen.getByTestId('location-search').textContent).toContain('order=title');

		fireEvent.click(screen.getByRole('button', { name: 'Reset sort order' }));
		expect(screen.getByTestId('location-search').textContent).not.toContain('order=');
		expect(screen.getByTestId('location-search').textContent).toContain('tag=nature');
	});

	it('opens a tag-filtered search from a poem tag', async () => {
		const { getSearchQueryOptions } = setup({ recentResult: makePage([poem]) });
		fireEvent.click(await screen.findByRole('button', { name: 'Search poems tagged nature' }));

		await waitFor(() =>
			expect(getSearchQueryOptions).toHaveBeenCalledWith(
				expect.objectContaining({ tags: ['nature'] }),
			),
		);
		expect(screen.getByTestId('location-search').textContent).toContain('tag=nature');
	});

	it('loads the next result page using the API cursor', async () => {
		const secondPoem = { ...poem, id: 22, title: 'Second river poem', slug: 'second-river' };
		const searchQueryFn = vi.fn((params: SearchPoemsParams) =>
			Promise.resolve(
				params.cursor === 22
					? makePage([secondPoem])
					: makePage([poem], { hasMore: true, nextCursor: 22 }),
			),
		);
		setup({ route: '/?tag=nature', searchQueryFn });

		expect(await screen.findByText('River poem')).toBeTruthy();
		fireEvent.click(screen.getByRole('button', { name: 'Load more poems' }));
		expect(await screen.findByText('Second river poem')).toBeTruthy();
		expect(searchQueryFn).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: 22 }));
	});

	it('shows the empty state for a search with no matches', async () => {
		setup({ route: '/?q=missing', searchResult: makePage([]) });
		expect(await screen.findByText('No poems match this search')).toBeTruthy();
	});

	it('shows the error state when search fails', async () => {
		setup({
			route: '/?q=broken',
			searchQueryFn: () => Promise.reject(new Error('network unavailable')),
		});
		expect(await screen.findByText('We could not load your feed right now.')).toBeTruthy();
	});
});

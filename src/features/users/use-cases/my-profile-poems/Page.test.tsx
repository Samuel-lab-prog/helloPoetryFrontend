// @vitest-environment happy-dom
import type { FullPoemType } from '@features/poems/public/types';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { clearTestAuthClient, setTestAuthClient } from '@root/test-support/authClientStore';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MyProfilePoemsPage } from './Page';

const { useMyPoemsMock } = vi.hoisted(() => ({ useMyPoemsMock: vi.fn() }));

vi.mock('@features/poems/public/hooks/useGetMyPoems', () => ({
	useMyPoems: useMyPoemsMock,
}));

const poems: FullPoemType[] = [
	makePoem(1, 'Published river', 'published', '2026-02-01T00:00:00.000Z'),
	makePoem(2, 'Old draft', 'draft', '2026-02-02T00:00:00.000Z'),
	makePoem(3, 'Recent draft', 'draft', '2026-02-03T00:00:00.000Z'),
];

function makePoem(
	id: number,
	title: string,
	status: FullPoemType['status'],
	updatedAt: string,
): FullPoemType {
	return {
		id,
		title,
		slug: title.toLowerCase().replaceAll(' ', '-'),
		excerpt: 'A short excerpt',
		content: 'Poem content',
		createdAt: new Date('2026-01-01T00:00:00.000Z'),
		updatedAt: new Date(updatedAt),
		audioUrl: null,
		status,
		visibility: 'private',
		moderationStatus: status === 'draft' ? 'approved' : 'pending',
		isCommentable: true,
		author: { id: 123, name: 'Writer', nickname: 'writer', avatarUrl: null },
		tags: [],
		stats: { likesCount: 0, commentsCount: 0, likedByCurrentUser: false },
	};
}

function LocationSearch() {
	const location = useLocation();
	return <output data-testid='location-search'>{`${location.pathname}${location.search}`}</output>;
}

function setup(route = '/my-profile/poems', myPoems = poems) {
	useMyPoemsMock.mockReturnValue({
		poems: myPoems,
		isLoading: false,
		isError: false,
		error: undefined,
	});
	return renderWithProviders(
		<>
			<MyProfilePoemsPage />
			<LocationSearch />
		</>,
		{ route },
	);
}

describe('MyProfilePoemsPage draft discovery', () => {
	beforeEach(() => {
		clearTestAuthClient();
		setTestAuthClient();
		vi.clearAllMocks();
	});

	it('filters by status, combines title search, and orders drafts by update time', async () => {
		setup();
		const status = screen.getByRole('combobox', { name: 'Filter poems by status' });
		expect(status).toHaveProperty('value', 'all');
		expect(screen.getByRole('option', { name: 'Drafts (2)' })).toBeTruthy();
		fireEvent.change(status, { target: { value: 'draft' } });
		expect(screen.getByTestId('location-search').textContent).toContain('status=draft');
		expect(await screen.findByText('Recent draft')).toBeTruthy();
		expect(screen.getByText('Old draft')).toBeTruthy();
		expect(
			screen.getByText('Recent draft').compareDocumentPosition(screen.getByText('Old draft')) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(screen.queryByText('Published river')).toBeNull();

		const search = screen.getByRole('textbox', { name: 'Search poems' });
		fireEvent.change(search, { target: { value: 'old' } });
		expect(await screen.findByText('Old draft')).toBeTruthy();
		await waitFor(() => expect(screen.queryByText('Recent draft')).toBeNull());

		fireEvent.change(search, { target: { value: '' } });
		fireEvent.change(status, { target: { value: 'published' } });
		expect(await screen.findByText('Published river')).toBeTruthy();
		expect(screen.queryByText('Old draft')).toBeNull();
	});

	it('restores the draft filter from the URL and navigates through the explicit resume action', async () => {
		setup('/my-profile/poems?status=draft');
		expect(screen.getByRole('combobox', { name: 'Filter poems by status' })).toHaveProperty(
			'value',
			'draft',
		);
		const resume = await screen.findByRole('button', { name: 'Continue writing Old draft' });
		const actions = screen.getAllByRole('button', { name: 'Open actions menu' })[0];
		expect(actions).toBeTruthy();
		fireEvent.click(actions);
		expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeTruthy();
		fireEvent.keyDown(document, { key: 'Escape' });
		fireEvent.click(resume);
		expect(screen.getByTestId('location-search').textContent).toContain(
			'/admin?mode=update&poemId=2',
		);
	});

	it('shows a dedicated empty state when the author has no drafts', async () => {
		setup('/my-profile/poems?status=draft', [poems[0]]);
		expect(await screen.findByText('You have no drafts yet.')).toBeTruthy();
	});
});

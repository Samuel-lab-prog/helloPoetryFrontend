// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeAdminPageScenario } from './makeAdminPageScenario';

vi.mock('../../create-poem/components/CreatePoemForm', () => ({
	CreatePoemForm: () => <div data-testid='create-poem-form'>Create poem form</div>,
}));

vi.mock('../../manage-poem/components/UpdatePoemForm', () => ({
	UpdatePoemForm: () => <div data-testid='update-poem-form'>Update poem form</div>,
}));

vi.mock('../../manage-poem/components/DeletePoemForm', () => ({
	DeletePoemForm: () => <div data-testid='delete-poem-form'>Delete poem form</div>,
}));

function expectModeLabel(label: string) {
	expect(screen.getByText((_, element) => element?.textContent === `Mode: ${label}`)).toBeTruthy();
}

describe('FEATURE PAGE - Poems - AdminPage', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		clearTestAuthClient();
	});

	it('shows a clear sign-in gate for logged-out visitors', () => {
		makeAdminPageScenario().asLoggedOutVisitor().render();

		expect(screen.getByText('POEM TOOLS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('Sign in to use poem tools')).toBeTruthy();
		expect(
			screen.getByText(
				'This page is available only after sign in. Sign in to create, update, or delete your poems.',
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
		expect(screen.queryByTestId('create-poem-form')).toBeNull();
		expect(screen.queryByTestId('update-poem-form')).toBeNull();
		expect(screen.queryByTestId('delete-poem-form')).toBeNull();
	});

	it('shows the create tool by default for active authors', async () => {
		makeAdminPageScenario().asActiveAuthor().render();

		expect(screen.getByRole('heading', { name: 'Admin Panel' })).toBeTruthy();
		expectModeLabel('Create Poem');
		expect(await screen.findByTestId('create-poem-form')).toBeTruthy();
		expect(screen.queryByText('POEM TOOLS UNAVAILABLE')).toBeNull();
	});

	it('uses the update mode from the route for active authors', async () => {
		makeAdminPageScenario().asActiveAuthor().withMode('update').render();

		expect(await screen.findByTestId('update-poem-form')).toBeTruthy();
		expectModeLabel('Update Poem');
		expect(screen.queryByTestId('create-poem-form')).toBeNull();
	});

	it('blocks suspended authors from creating poems with a consistent message', () => {
		makeAdminPageScenario().asSuspendedAuthor().render();

		expect(screen.getByText('POEM TOOLS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('Poem tool unavailable')).toBeTruthy();
		expect(
			screen.getByText(
				'This account privilege is unavailable while your account is suspended: create poems.',
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')).toBe('/');
		expect(screen.queryByTestId('create-poem-form')).toBeNull();
	});

	it('blocks suspended authors from updating poems with a consistent message', async () => {
		makeAdminPageScenario().asSuspendedAuthor().withMode('update').render();

		expect(await screen.findByText('Poem tool unavailable')).toBeTruthy();
		expect(
			screen.getByText(
				'This account privilege is unavailable while your account is suspended: update poems.',
			),
		).toBeTruthy();
		expect(screen.queryByTestId('update-poem-form')).toBeNull();
	});

	it('blocks banned authors from deleting poems with a consistent message', async () => {
		makeAdminPageScenario().asBannedAuthor().withMode('delete').render();

		expect(await screen.findByText('Poem tool unavailable')).toBeTruthy();
		expect(
			screen.getByText(
				"This account has been banned, so you can't delete poems. If you think this is a mistake, please contact support.",
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to profile' }).getAttribute('href')).toBe(
			'/my-profile',
		);
		expect(screen.queryByTestId('delete-poem-form')).toBeNull();
	});

	it('keeps delete available for suspended authors', async () => {
		makeAdminPageScenario().asSuspendedAuthor().withMode('delete').render();

		expect(await screen.findByTestId('delete-poem-form')).toBeTruthy();
		expectModeLabel('Delete Poem');
		expect(screen.queryByText('Poem tool unavailable')).toBeNull();
	});
});

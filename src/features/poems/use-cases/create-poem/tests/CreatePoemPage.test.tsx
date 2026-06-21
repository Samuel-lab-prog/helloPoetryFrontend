// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makeCreatePoemPageScenario } from './makeCreatePoemPageScenario';

vi.mock('../components/CreatePoemForm', () => ({
	CreatePoemForm: () => <div data-testid='create-poem-form'>Create poem form</div>,
}));

describe('FEATURE PAGE - Poems - CreatePoemPage', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		clearTestAuthClient();
	});

	it('shows a clear sign-in gate for logged-out visitors', () => {
		makeCreatePoemPageScenario().asLoggedOutVisitor().render();

		expect(screen.getByText('POEMS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('Sign in to create a poem')).toBeTruthy();
		expect(
			screen.getByText(
				'This page is available only after sign in. Sign in to draft, publish, and manage your poems.',
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
		expect(screen.getByRole('link', { name: 'Create account' }).getAttribute('href')).toBe(
			'/register',
		);
		expect(screen.queryByTestId('create-poem-form')).toBeNull();
	});

	it('shows the create form for active authors', () => {
		makeCreatePoemPageScenario().asActiveAuthor().render();

		expect(screen.getByRole('heading', { name: 'Create Poem' })).toBeTruthy();
		expect(screen.getByTestId('create-poem-form')).toBeTruthy();
		expect(screen.queryByText('POEMS UNAVAILABLE')).toBeNull();
	});

	it('blocks suspended authors with a consistent privilege message', () => {
		makeCreatePoemPageScenario().asSuspendedAuthor().render();

		expect(screen.getByText('POEMS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('Create poem unavailable')).toBeTruthy();
		expect(
			screen.getByText(
				'This account privilege is unavailable while your account is suspended: create poems.',
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')).toBe('/');
		expect(screen.queryByTestId('create-poem-form')).toBeNull();
	});

	it('blocks banned authors with a consistent privilege message', () => {
		makeCreatePoemPageScenario().asBannedAuthor().render();

		expect(screen.getByText('POEMS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByText('Create poem unavailable')).toBeTruthy();
		expect(
			screen.getByText(
				"This account has been banned, so you can't create poems. If you think this is a mistake, please contact support.",
			),
		).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go to profile' }).getAttribute('href')).toBe(
			'/my-profile',
		);
		expect(screen.queryByTestId('create-poem-form')).toBeNull();
	});
});

// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthRequiredCard } from '../AuthRequiredCard';

describe('FEATURE COMPONENT - Auth - AuthRequiredCard', () => {
	it('renders sign-in and account creation actions by default', () => {
		renderWithProviders(
			<AuthRequiredCard
				title='Sign in to continue'
				description='This page is available only after sign in.'
			/>,
		);

		expect(screen.getByRole('alert')).toBeTruthy();
		expect(screen.getByText('SIGN IN REQUIRED')).toBeTruthy();
		expect(screen.getByText('Sign in to continue')).toBeTruthy();
		expect(screen.getByText('This page is available only after sign in.')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
		expect(screen.getByRole('link', { name: 'Create account' }).getAttribute('href')).toBe(
			'/register',
		);
	});

	it('can hide the create-account action and use contextual eyebrow copy', () => {
		renderWithProviders(
			<AuthRequiredCard
				eyebrow='POEMS UNAVAILABLE'
				title='Sign in to create a poem'
				description='Sign in to draft, publish, and manage your poems.'
				showCreateAccount={false}
			/>,
		);

		expect(screen.getByText('POEMS UNAVAILABLE')).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
		expect(screen.queryByRole('link', { name: 'Create account' })).toBeNull();
	});
});

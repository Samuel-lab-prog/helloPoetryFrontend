// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { screen } from '@testing-library/react';
import { Info } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyStateCard } from '../Component';

describe('CORE COMPONENT - EmptyStateCard', () => {
	it('renders as a polite status region by default', () => {
		renderWithProviders(
			<EmptyStateCard
				eyebrow='No poems yet'
				eyebrowIcon={Info}
				title='Nothing to show'
				description='New poems will appear here.'
			/>,
		);

		const region = screen.getByRole('status');

		expect(region.getAttribute('aria-live')).toBe('polite');
		expect(screen.getByText('No poems yet')).toBeTruthy();
		expect(screen.getByRole('heading', { name: 'Nothing to show' })).toBeTruthy();
		expect(screen.getByText('New poems will appear here.')).toBeTruthy();
	});

	it('can render assertive alert states with custom action and children', () => {
		renderWithProviders(
			<EmptyStateCard
				role='alert'
				ariaLive='assertive'
				title='Comments unavailable'
				description='Try again later.'
				action={<a href='/'>Go home</a>}
			>
				<p>Extra details</p>
			</EmptyStateCard>,
		);

		const region = screen.getByRole('alert');

		expect(region.getAttribute('aria-live')).toBe('assertive');
		expect(screen.getByRole('heading', { name: 'Comments unavailable' })).toBeTruthy();
		expect(screen.getByRole('link', { name: 'Go home' }).getAttribute('href')).toBe('/');
		expect(screen.getByText('Extra details')).toBeTruthy();
	});
});

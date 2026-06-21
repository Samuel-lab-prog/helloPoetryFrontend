// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorStateCard } from '../Component';

describe('CORE COMPONENT - ErrorStateCard', () => {
	it('renders the default accessible error state', () => {
		renderWithProviders(
			<ErrorStateCard title='Could not load poems' description='Try again in a moment.' />,
		);

		expect(screen.getByRole('alert')).toBeTruthy();
		expect(screen.getByText('SOMETHING WENT WRONG')).toBeTruthy();
		expect(screen.getByText('Could not load poems')).toBeTruthy();
		expect(screen.getByText('Try again in a moment.')).toBeTruthy();
	});

	it('renders the default action button when onAction is provided', () => {
		const onAction = vi.fn();

		renderWithProviders(
			<ErrorStateCard
				title='Could not load poems'
				description='Try again in a moment.'
				actionLabel='Reload poems'
				onAction={onAction}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Reload poems' }));

		expect(onAction).toHaveBeenCalledTimes(1);
	});

	it('prefers a custom action over the default action button', () => {
		const onAction = vi.fn();

		renderWithProviders(
			<ErrorStateCard
				title='Could not load poems'
				description='Try again in a moment.'
				action={<a href='/poems'>Back to poems</a>}
				actionLabel='Reload poems'
				onAction={onAction}
			/>,
		);

		expect(screen.getByRole('link', { name: 'Back to poems' }).getAttribute('href')).toBe('/poems');
		expect(screen.queryByRole('button', { name: 'Reload poems' })).toBeNull();
	});
});

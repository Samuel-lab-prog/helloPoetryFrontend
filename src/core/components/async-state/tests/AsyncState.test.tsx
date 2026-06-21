// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AsyncState } from '../Component';

describe('CORE COMPONENT - AsyncState', () => {
	it('renders children when no async state is active', () => {
		renderWithProviders(
			<AsyncState>
				<p>Loaded content</p>
			</AsyncState>,
		);

		expect(screen.getByText('Loaded content')).toBeTruthy();
	});

	it('renders the default error state before any other state', () => {
		renderWithProviders(
			<AsyncState isError isLoading isEmpty>
				<p>Loaded content</p>
			</AsyncState>,
		);

		expect(screen.getByText('Error')).toBeTruthy();
		expect(screen.queryByText('Loading...')).toBeNull();
		expect(screen.queryByText('No data found.')).toBeNull();
		expect(screen.queryByText('Loaded content')).toBeNull();
	});

	it('renders the default loading state before empty content', () => {
		renderWithProviders(
			<AsyncState isLoading isEmpty>
				<p>Loaded content</p>
			</AsyncState>,
		);

		expect(screen.getByText('Loading...')).toBeTruthy();
		expect(screen.queryByText('No data found.')).toBeNull();
		expect(screen.queryByText('Loaded content')).toBeNull();
	});

	it('renders the default empty state before children', () => {
		renderWithProviders(
			<AsyncState isEmpty>
				<p>Loaded content</p>
			</AsyncState>,
		);

		expect(screen.getByText('No data found.')).toBeTruthy();
		expect(screen.queryByText('Loaded content')).toBeNull();
	});

	it('renders custom elements for each async state', () => {
		const { rerender } = renderWithProviders(
			<AsyncState
				isError
				errorElement={<p>Custom error</p>}
				loadingElement={<p>Custom loading</p>}
				emptyElement={<p>Custom empty</p>}
			>
				<p>Loaded content</p>
			</AsyncState>,
		);

		expect(screen.getByText('Custom error')).toBeTruthy();

		rerender(
			<AsyncState
				isLoading
				errorElement={<p>Custom error</p>}
				loadingElement={<p>Custom loading</p>}
				emptyElement={<p>Custom empty</p>}
			>
				<p>Loaded content</p>
			</AsyncState>,
		);
		expect(screen.getByText('Custom loading')).toBeTruthy();

		rerender(
			<AsyncState
				isEmpty
				errorElement={<p>Custom error</p>}
				loadingElement={<p>Custom loading</p>}
				emptyElement={<p>Custom empty</p>}
			>
				<p>Loaded content</p>
			</AsyncState>,
		);
		expect(screen.getByText('Custom empty')).toBeTruthy();
	});
});

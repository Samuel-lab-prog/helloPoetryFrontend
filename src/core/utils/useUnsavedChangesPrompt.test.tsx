// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useUnsavedChangesPrompt } from './useUnsavedChangesPrompt';

function GuardedPage({ isDirty, isSaving = false }: { isDirty: boolean; isSaving?: boolean }) {
	useUnsavedChangesPrompt(isDirty, isSaving);
	return (
		<>
			<p>Editor</p>
			<Link to='/next'>Next page</Link>
		</>
	);
}

function SaveablePage() {
	const [isDirty, setIsDirty] = useState(true);
	useUnsavedChangesPrompt(isDirty);
	return <button onClick={() => setIsDirty(false)}>Save successfully</button>;
}

function renderRouter(isDirty: boolean, isSaving = false) {
	const router = createMemoryRouter(
		[
			{ path: '/', element: <GuardedPage isDirty={isDirty} isSaving={isSaving} /> },
			{ path: '/next', element: <p>Next page content</p> },
		],
		{ initialEntries: ['/'] },
	);
	const view = render(<RouterProvider router={router} />);
	return { ...view, router };
}

describe('useUnsavedChangesPrompt', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('allows navigation without a prompt when the form is clean', async () => {
		const confirm = vi.fn();
		vi.stubGlobal('confirm', confirm);
		const { router } = renderRouter(false);

		fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
		await waitFor(() => expect(router.state.location.pathname).toBe('/next'));
		expect(confirm).not.toHaveBeenCalled();
	});

	it('keeps the user on the page when dirty navigation is cancelled', async () => {
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
		const { router } = renderRouter(true);

		fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
		await waitFor(() => expect(router.state.location.pathname).toBe('/'));
		expect(screen.getByText('Editor')).toBeTruthy();
	});

	it('discards changes only after the user confirms navigation', async () => {
		vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
		const { router } = renderRouter(true);

		fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
		await waitFor(() => expect(router.state.location.pathname).toBe('/next'));
		expect(screen.getByText('Next page content')).toBeTruthy();
	});

	it('keeps a pending save dirty and explains that it is still in progress', async () => {
		const confirm = vi.fn().mockReturnValue(false);
		vi.stubGlobal('confirm', confirm);
		renderRouter(true, true);

		fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
		await waitFor(() => expect(confirm).toHaveBeenCalled());
		expect(confirm.mock.calls[0]?.[0]).toContain('still in progress');
	});

	it('blocks beforeunload while dirty and removes the listener on unmount', () => {
		const addListener = vi.spyOn(window, 'addEventListener');
		const removeListener = vi.spyOn(window, 'removeEventListener');
		const { unmount } = renderRouter(true);
		expect(addListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));

		const event = new Event('beforeunload', { cancelable: true });
		window.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);

		unmount();
		expect(removeListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
	});

	it('removes beforeunload protection after a successful save', async () => {
		const removeListener = vi.spyOn(window, 'removeEventListener');
		const router = createMemoryRouter([{ path: '/', element: <SaveablePage /> }], {
			initialEntries: ['/'],
		});
		render(<RouterProvider router={router} />);
		fireEvent.click(screen.getByRole('button', { name: 'Save successfully' }));
		await waitFor(() =>
			expect(removeListener).toHaveBeenCalledWith('beforeunload', expect.any(Function)),
		);

		const event = new Event('beforeunload', { cancelable: true });
		window.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});
});

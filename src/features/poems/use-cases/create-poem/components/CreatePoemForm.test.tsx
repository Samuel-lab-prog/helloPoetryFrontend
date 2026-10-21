// @vitest-environment happy-dom
import { poems } from '@Api/poems/endpoints';
import { Provider } from '@BaseComponents';
import { createTestQueryClient } from '@root/core/testing/renderHookWithQueryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createdPoem } from '../hooks/tests/fixtures';
import { uploadPoemAudioFile } from '../utils/poemAudioUpload';
import { CreatePoemForm } from './CreatePoemForm';

vi.mock('../utils/poemAudioUpload', () => ({
	uploadPoemAudioFile: vi.fn().mockRejectedValue(new Error('Upload service unavailable')),
}));

describe('CreatePoemForm', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	function renderCreatePoemForm() {
		const queryClient = createTestQueryClient();
		const router = createMemoryRouter(
			[
				{
					path: '/',
					element: (
						<QueryClientProvider client={queryClient}>
							<Provider forcedTheme='light'>
								<CreatePoemForm />
							</Provider>
						</QueryClientProvider>
					),
				},
			],
			{ initialEntries: ['/'] },
		);
		return render(<RouterProvider router={router} />);
	}

	it('preserves the form when audio upload fails after poem creation', async () => {
		const createPoem = vi.spyOn(poems.createPoem, 'mutate').mockResolvedValue(createdPoem);
		vi.spyOn(poems.updatePoemAudio, 'mutate').mockResolvedValue({ audioUrl: null });
		const { container } = renderCreatePoemForm();

		fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
			target: { value: 'A poem to keep' },
		});
		fireEvent.change(screen.getByRole('textbox', { name: 'Summary' }), {
			target: { value: 'A short test summary' },
		});
		fireEvent.change(screen.getByRole('textbox', { name: 'Content (Markdown)' }), {
			target: { value: 'The poem remains here.' },
		});
		const audioInput = container.querySelector('input[type="file"]');
		expect(audioInput).not.toBeNull();
		fireEvent.change(audioInput as HTMLInputElement, {
			target: { files: [new File(['audio'], 'reading.mp3', { type: 'audio/mpeg' })] },
		});

		const submitButton = screen.getByRole('button', { name: 'Create Poem' });
		await waitFor(() => expect((submitButton as HTMLButtonElement).disabled).toBe(false));
		fireEvent.click(submitButton);

		await waitFor(() => expect(createPoem).toHaveBeenCalledTimes(1));
		await waitFor(() =>
			expect((screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement).value).toBe(
				'A poem to keep',
			),
		);
		expect(
			(screen.getByRole('textbox', { name: 'Content (Markdown)' }) as HTMLTextAreaElement).value,
		).toBe('The poem remains here.');
		expect((audioInput as HTMLInputElement).files?.[0]?.name).toBe('reading.mp3');
		expect(screen.getByText('Upload service unavailable')).toBeTruthy();
		expect(screen.getByText(/Your poem was created/)).toBeTruthy();

		fireEvent.click(screen.getByRole('button', { name: 'Retry audio upload' }));
		await waitFor(() => expect(uploadPoemAudioFile).toHaveBeenCalledTimes(2));
		expect(createPoem).toHaveBeenCalledTimes(1);
	});

	it('preserves the form when poem creation itself fails', async () => {
		const createPoem = vi
			.spyOn(poems.createPoem, 'mutate')
			.mockRejectedValue(new Error('Network unavailable'));
		renderCreatePoemForm();

		fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
			target: { value: 'A poem to keep' },
		});
		fireEvent.change(screen.getByRole('textbox', { name: 'Summary' }), {
			target: { value: 'A short test summary' },
		});
		fireEvent.change(screen.getByRole('textbox', { name: 'Content (Markdown)' }), {
			target: { value: 'The poem remains here.' },
		});

		const submitButton = screen.getByRole('button', { name: 'Create Poem' });
		await waitFor(() => expect((submitButton as HTMLButtonElement).disabled).toBe(false));
		fireEvent.click(submitButton);

		await waitFor(() => expect(createPoem).toHaveBeenCalledTimes(1));
		expect((screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement).value).toBe(
			'A poem to keep',
		);
		expect(
			(screen.getByRole('textbox', { name: 'Content (Markdown)' }) as HTMLTextAreaElement).value,
		).toBe('The poem remains here.');
		expect(screen.getByText('Error creating the poem. Please try again later.')).toBeTruthy();
	});
});

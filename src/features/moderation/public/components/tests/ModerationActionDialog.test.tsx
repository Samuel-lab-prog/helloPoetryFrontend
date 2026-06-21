// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ModerationActionDialog } from '../ModerationActionDialog';
import { pendingPoem, targetAuthor } from './fixtures';

describe('FEATURE COMPONENT - Moderation - ModerationActionDialog', () => {
	it('confirms poem approval without requiring reason or duration', async () => {
		const onConfirm = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<ModerationActionDialog
				action='approve-poem'
				poem={pendingPoem}
				isOpen
				isSubmitting={false}
				onClose={vi.fn()}
				onConfirm={onConfirm}
			/>,
		);

		expect(screen.getByRole('dialog', { name: 'Approve "Pending poem"' })).toBeTruthy();
		fireEvent.click(screen.getByRole('button', { name: 'Approve poem' }));

		await waitFor(() =>
			expect(onConfirm).toHaveBeenCalledWith({
				reason: undefined,
				durationDays: undefined,
			}),
		);
	});

	it('requires a meaningful reason before rejecting a poem', async () => {
		const onConfirm = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<ModerationActionDialog
				action='reject-poem'
				poem={pendingPoem}
				isOpen
				isSubmitting={false}
				onClose={vi.fn()}
				onConfirm={onConfirm}
			/>,
		);

		const confirmButton = screen.getByRole('button', { name: 'Reject poem' }) as HTMLButtonElement;
		expect(confirmButton.disabled).toBe(true);
		expect(screen.getByText('At least 10 characters.')).toBeTruthy();

		fireEvent.change(screen.getByPlaceholderText('Explain the moderation decision'), {
			target: { value: 'too short' },
		});
		expect(screen.getByText('Reason must be at least 10 characters.')).toBeTruthy();
		expect(confirmButton.disabled).toBe(true);

		fireEvent.change(screen.getByPlaceholderText('Explain the moderation decision'), {
			target: { value: '  repeated plagiarism  ' },
		});
		expect(screen.getByText('19/500 characters.')).toBeTruthy();
		expect(confirmButton.disabled).toBe(false);

		fireEvent.click(confirmButton);

		await waitFor(() =>
			expect(onConfirm).toHaveBeenCalledWith({
				reason: 'repeated plagiarism',
				durationDays: undefined,
			}),
		);
	});

	it('validates suspension duration and sends reason plus duration', async () => {
		const onConfirm = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<ModerationActionDialog
				action='suspend-user'
				user={targetAuthor}
				isOpen
				isSubmitting={false}
				onClose={vi.fn()}
				onConfirm={onConfirm}
			/>,
		);

		const durationInput = screen.getByLabelText('Duration in days') as HTMLInputElement;
		const reasonInput = screen.getByPlaceholderText('Explain the moderation decision');
		const confirmButton = screen.getByRole('button', { name: 'Suspend user' }) as HTMLButtonElement;

		fireEvent.change(reasonInput, {
			target: { value: 'harassment in comments' },
		});
		fireEvent.change(durationInput, {
			target: { value: '0' },
		});

		expect(screen.getByText('Use a number between 1 and 365.')).toBeTruthy();
		expect(confirmButton.disabled).toBe(true);

		fireEvent.change(durationInput, {
			target: { value: '14' },
		});
		expect(confirmButton.disabled).toBe(false);

		fireEvent.click(confirmButton);

		await waitFor(() =>
			expect(onConfirm).toHaveBeenCalledWith({
				reason: 'harassment in comments',
				durationDays: 14,
			}),
		);
	});

	it('closes from cancel, backdrop click, and Escape', () => {
		const onClose = vi.fn();

		const { rerender } = renderWithProviders(
			<ModerationActionDialog
				action='ban-user'
				user={targetAuthor}
				isOpen
				isSubmitting={false}
				onClose={onClose}
				onConfirm={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onClose).toHaveBeenCalledTimes(1);

		rerender(
			<ModerationActionDialog
				action='ban-user'
				user={targetAuthor}
				isOpen
				isSubmitting={false}
				onClose={onClose}
				onConfirm={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole('dialog').parentElement!);
		expect(onClose).toHaveBeenCalledTimes(2);

		fireEvent.keyDown(window, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledTimes(3);
	});
});

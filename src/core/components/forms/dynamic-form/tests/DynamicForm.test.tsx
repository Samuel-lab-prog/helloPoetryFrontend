// @vitest-environment happy-dom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeDynamicFormScenario } from './makeDynamicFormScenario';

describe('CORE COMPONENT - DynamicForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('renders fields, character count, extra content, and submit action', () => {
		makeDynamicFormScenario()
			.withDefaultValues({ title: 'A title' })
			.withExtraContent(<p>Optional helper content</p>)
			.render();

		expect(screen.getByLabelText(/Title/)).toBeTruthy();
		expect(screen.getByLabelText('Summary')).toBeTruthy();
		expect(screen.getByText('7/40 characters')).toBeTruthy();
		expect(screen.getByText('Optional helper content')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Save poem' })).toBeTruthy();
	});

	it('renders general errors as accessible form alerts', () => {
		makeDynamicFormScenario().withGeneralError('This account cannot create poems.').render();

		const alert = screen.getByRole('alert');

		expect(alert.getAttribute('aria-live')).toBe('polite');
		expect(screen.getByText('This account cannot create poems.')).toBeTruthy();
	});

	it('submits the current field values when the form is valid', async () => {
		const scenario = makeDynamicFormScenario();
		scenario.render();

		fireEvent.change(screen.getByLabelText(/Title/), {
			target: { value: 'New title' },
		});
		fireEvent.change(screen.getByLabelText('Summary'), {
			target: { value: 'New summary' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Save poem' }));

		await waitFor(() =>
			expect(scenario.mocks.onSubmit).toHaveBeenCalledWith(
				{
					title: 'New title',
					summary: 'New summary',
				},
				expect.anything(),
			),
		);
	});

	it('keeps submit disabled when the form is invalid', () => {
		makeDynamicFormScenario().asInvalid().render();

		const submitButton = screen.getByRole('button', { name: 'Save poem' }) as HTMLButtonElement;

		expect(submitButton.disabled).toBe(true);
	});

	it('keeps submit disabled while loading', () => {
		makeDynamicFormScenario().asLoading().render();

		const submitButton = screen.getByRole('button', { name: 'Save poem' }) as HTMLButtonElement;

		expect(submitButton.disabled).toBe(true);
	});
});

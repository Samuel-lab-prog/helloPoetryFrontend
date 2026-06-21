// @vitest-environment happy-dom
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchInput } from '../Component';

describe('CORE COMPONENT - SearchInput', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('renders an accessible controlled input', () => {
		renderWithProviders(
			<SearchInput
				label='Search poets'
				placeholder='Type a name'
				value='Ada'
				onValueChange={vi.fn()}
			/>,
		);

		const input = screen.getByLabelText('Search poets') as HTMLInputElement;

		expect(input.value).toBe('Ada');
		expect(input.placeholder).toBe('Type a name');
	});

	it('notifies immediate changes as the user types', () => {
		const onValueChange = vi.fn();

		renderWithProviders(
			<SearchInput label='Search poems' value='' onValueChange={onValueChange} />,
		);

		fireEvent.change(screen.getByLabelText('Search poems'), {
			target: { value: 'river' },
		});

		expect(onValueChange).toHaveBeenCalledWith('river');
	});

	it('debounces value changes when a debounced handler is provided', () => {
		const onDebouncedChange = vi.fn();
		const { rerender } = renderWithProviders(
			<SearchInput
				label='Search poems'
				value=''
				onValueChange={vi.fn()}
				onDebouncedChange={onDebouncedChange}
				debounceMs={400}
			/>,
		);

		rerender(
			<SearchInput
				label='Search poems'
				value='riv'
				onValueChange={vi.fn()}
				onDebouncedChange={onDebouncedChange}
				debounceMs={400}
			/>,
		);
		rerender(
			<SearchInput
				label='Search poems'
				value='river'
				onValueChange={vi.fn()}
				onDebouncedChange={onDebouncedChange}
				debounceMs={400}
			/>,
		);

		vi.advanceTimersByTime(399);
		expect(onDebouncedChange).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(onDebouncedChange).toHaveBeenCalledTimes(1);
		expect(onDebouncedChange).toHaveBeenCalledWith('river');
	});

	it('works without a debounced handler', () => {
		const onValueChange = vi.fn();

		renderWithProviders(
			<SearchInput label='Search poems' value='river' onValueChange={onValueChange} />,
		);

		fireEvent.change(screen.getByLabelText('Search poems'), {
			target: { value: 'moon' },
		});
		vi.advanceTimersByTime(1000);

		expect(onValueChange).toHaveBeenCalledWith('moon');
	});
});

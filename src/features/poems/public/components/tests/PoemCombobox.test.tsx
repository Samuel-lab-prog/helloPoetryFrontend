// @vitest-environment happy-dom
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makePoemComboboxScenario } from './makePoemComboboxScenario';

const poems = [
	{ id: 44, title: 'A river remembers' },
	{ id: 45, title: 'Night draft' },
	{ id: 46, title: 'Morning field' },
];

function getPoemInput() {
	return screen.getByPlaceholderText('Select a poem') as HTMLInputElement;
}

function openCombobox() {
	const input = getPoemInput();
	fireEvent.focus(input);
	fireEvent.click(input);
	return input;
}

describe('FEATURE COMPONENT - Poems - PoemCombobox', () => {
	it('renders the required poem field with no selected value', () => {
		makePoemComboboxScenario().withPoems(poems).render();

		expect(screen.getByText('Poem')).toBeTruthy();
		expect(getPoemInput()).toBeTruthy();
		expect(screen.getByText('Selected poem: none')).toBeTruthy();
	});

	it('shows loading copy while poem options are unavailable', async () => {
		makePoemComboboxScenario().withLoadingPoems().render();

		openCombobox();

		expect(await screen.findByText('Loading poems...')).toBeTruthy();
	});

	it('shows empty copy when the loaded poem list has no matches', async () => {
		makePoemComboboxScenario().withPoems(poems).render();

		const input = openCombobox();
		fireEvent.change(input, {
			target: { value: 'missing title' },
		});

		expect(await screen.findByText('No poems found.')).toBeTruthy();
	});

	it('selects a poem and writes the selected id into the form', async () => {
		makePoemComboboxScenario().withPoems(poems).render();

		const input = openCombobox();
		fireEvent.change(input, {
			target: { value: 'river' },
		});
		fireEvent.click(await screen.findByText('A river remembers'));

		await waitFor(() => expect(screen.getByText('Selected poem: 44')).toBeTruthy());
		expect(input.value).toBe('A river remembers');
	});

	it('renders the initially selected poem title from the form value', async () => {
		makePoemComboboxScenario().withPoems(poems).withDefaultPoemId(45).render();

		await waitFor(() => expect(getPoemInput().value).toBe('Night draft'));
		expect(screen.getByText('Selected poem: 45')).toBeTruthy();
	});

	it('renders validation errors below the field', () => {
		makePoemComboboxScenario()
			.withPoems(poems)
			.withError('Choose a poem before continuing.')
			.render();

		expect(screen.getByText('Choose a poem before continuing.')).toBeTruthy();
	});
});

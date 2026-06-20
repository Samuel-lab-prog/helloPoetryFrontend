// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { updatePoemData } from './fixtures';
import { makeUpdatePoemFormScenario } from './makeUpdatePoemFormScenario';

describe('FEATURE HOOK - Poems - useUpdatePoemForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('blocks submission and marks the field when forbidden words are present', async () => {
		const scenario = makeUpdatePoemFormScenario().withUpdateSuccess();

		const { result } = scenario.render();
		void result.current.formState.errors.content;

		await act(async () => {
			await result.current.onSubmit({
				...updatePoemData,
				content: 'This content includes bosta.',
			});
		});

		expect(scenario.mocks.updatePoem).not.toHaveBeenCalled();
		expect(result.current.formState.errors.content?.message).toContain('Remove forbidden words');
	});

	it('updates the poem, invalidates cached poem lists, and shows success feedback', async () => {
		const scenario = makeUpdatePoemFormScenario().asModerator().withUpdateSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.onSubmit({
				...updatePoemData,
				status: 'published',
			});
		});

		expect(scenario.mocks.updatePoem).toHaveBeenCalledWith(
			expect.objectContaining({
				id: String(updatePoemData.id),
				title: updatePoemData.title,
			}),
		);
		expect(scenario.mocks.invalidateQueries).toHaveBeenCalled();
		expect(scenario.mocks.toaster).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'success',
				title: 'Poem updated',
				description: 'Your poem was published and approved instantly.',
			}),
		);
	});

	it('maps duplicate title conflicts to the title field', async () => {
		const scenario = makeUpdatePoemFormScenario().withUpdateFailure({
			statusCode: 409,
			message: 'slug already exists for title',
		});

		const { result } = scenario.render();
		void result.current.formState.errors.title;

		await act(async () => {
			await result.current.onSubmit(updatePoemData);
		});

		await waitFor(() =>
			expect(result.current.formState.errors.title?.message).toBe(
				'A poem already exists with this new title.',
			),
		);
	});
});

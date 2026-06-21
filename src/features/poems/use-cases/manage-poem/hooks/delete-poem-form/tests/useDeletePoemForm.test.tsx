// @vitest-environment happy-dom
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { poemId } from './fixtures';
import { makeDeletePoemFormScenario } from './makeDeletePoemFormScenario';

describe('FEATURE HOOK - Poems - useDeletePoemForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('deletes a poem, invalidates lists, and shows success feedback', async () => {
		const scenario = makeDeletePoemFormScenario().withCachedPoem().withDeleteSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.onSubmit({ id: poemId });
		});

		expect(scenario.mocks.deletePoem).toHaveBeenCalledWith(String(poemId));
		expect(scenario.getMyPoems()).toEqual([]);
		expect(scenario.getPoem()).toBeUndefined();
		expect(scenario.mocks.toaster).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'success',
				title: 'Poem deleted',
			}),
		);
	});

	it('restores cached poem data and shows an error when deletion fails', async () => {
		const scenario = makeDeletePoemFormScenario()
			.withCachedPoem()
			.withDeleteFailure({ statusCode: 404 });

		const { result } = scenario.render();

		await act(async () => {
			await result.current.onSubmit({ id: poemId });
		});

		expect(scenario.getMyPoems()).toEqual([scenario.expectedPoem]);
		expect(scenario.getPoem()).toEqual(scenario.expectedPoem);
		await waitFor(() => expect(result.current.generalError).toBe('Poem not found.'));
	});
});

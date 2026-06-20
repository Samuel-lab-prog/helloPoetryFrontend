// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { poemId, savedPoem } from './fixtures';
import { makeSavedPoemsScenario } from './makeSavedPoemsScenario';

describe('FEATURE HOOK - Poems - useSavedPoems', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does not expose saved poems for banned users', () => {
		const scenario = makeSavedPoemsScenario()
			.asBannedUser()
			.withSavedPoems([savedPoem]);

		const { result } = scenario.render();

		expect(result.current.savedPoems).toEqual([]);
		expect(result.current.saveError).toContain("can't view saved poems");
	});

	it('adds a saved poem optimistically from the cached poem detail', async () => {
		const scenario = makeSavedPoemsScenario()
			.asAuthenticatedUser()
			.withSavedPoems([])
			.withCachedPoem()
			.withSavePending();

		const { result } = scenario.render();

		let savePromise!: Promise<void>;
		act(() => {
			savePromise = result.current.savePoem(poemId);
		});

		await waitFor(() => expect(scenario.getSavedPoems()).toHaveLength(1));
		expect(scenario.mocks.savePoem).toHaveBeenCalledWith(String(poemId));
		expect(scenario.getSavedPoems()).toEqual([
			expect.objectContaining({
				id: poemId,
				title: 'A cached poem',
			}),
		]);

		(scenario.mocks.resolveSave as () => void)();
		await act(async () => {
			await savePromise;
		});
	});

	it('restores saved poems when unsave fails', async () => {
		const scenario = makeSavedPoemsScenario()
			.asAuthenticatedUser()
			.withSavedPoems([savedPoem])
			.withUnsaveFailure({ statusCode: 403 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.unsavePoem(poemId);
			}),
		).rejects.toMatchObject({ statusCode: 403 });

		expect(scenario.getSavedPoems()).toEqual([savedPoem]);
		await waitFor(() =>
			expect(result.current.saveError).toBe('You do not have permission to change saved poems.'),
		);
	});
});

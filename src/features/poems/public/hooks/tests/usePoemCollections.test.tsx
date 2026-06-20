// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { collectionId, poemCollection, poemId } from './fixtures';
import { makePoemCollectionsScenario } from './makePoemCollectionsScenario';

describe('FEATURE HOOK - Poems - usePoemCollections', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('does not expose collections for banned users', () => {
		const scenario = makePoemCollectionsScenario()
			.asBannedUser()
			.withCollections([poemCollection]);

		const { result } = scenario.render();

		expect(result.current.collections).toEqual([]);
		expect(result.current.isCollectionsError).toBe(true);
		expect(result.current.collectionsError).toContain("can't view collections");
	});

	it('creates a collection optimistically with normalized description', async () => {
		const scenario = makePoemCollectionsScenario()
			.asAuthenticatedUser()
			.withCollections([])
			.withCreatePending();

		const { result } = scenario.render();

		let createPromise!: Promise<void>;
		act(() => {
			createPromise = result.current.createCollection({
				userId: 123,
				name: '  New shelf  ',
				description: '  Worth rereading  ',
			});
		});

		await waitFor(() => expect(scenario.getCollections()).toHaveLength(1));
		expect(scenario.mocks.createCollection).toHaveBeenCalledWith({
			userId: 123,
			name: '  New shelf  ',
			description: 'Worth rereading',
		});
		expect(scenario.getCollections()?.[0]).toEqual(
			expect.objectContaining({
				name: 'New shelf',
				description: 'Worth rereading',
			}),
		);

		(scenario.mocks.resolveCreate as () => void)();
		await act(async () => {
			await createPromise;
		});
	});

	it('does not call the add-item mutation when the poem is already in the collection', async () => {
		const scenario = makePoemCollectionsScenario()
			.asAuthenticatedUser()
			.withCollections([poemCollection])
			.withAddItemSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.addPoemToCollection({ collectionId, poemId });
		});

		expect(scenario.mocks.addItemToCollection).not.toHaveBeenCalled();
		expect(scenario.getCollections()).toEqual([poemCollection]);
	});

	it('restores collection items when removing a poem fails', async () => {
		const scenario = makePoemCollectionsScenario()
			.asAuthenticatedUser()
			.withCollections([poemCollection])
			.withRemoveItemFailure({ statusCode: 404 });

		const { result } = scenario.render();

		await expect(
			act(async () => {
				await result.current.removePoemFromCollection({ collectionId, poemId });
			}),
		).rejects.toMatchObject({ statusCode: 404 });

		expect(scenario.getCollections()).toEqual([poemCollection]);
		await waitFor(() =>
			expect(result.current.collectionsError).toBe('Collection or poem not found.'),
		);
	});
});

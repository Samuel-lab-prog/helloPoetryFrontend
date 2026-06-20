import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { PoemCollection } from '@Api/poems/types';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { usePoemCollections } from '../useManagePoemCollections';
import { getCollections, poemCollection, seedCollections } from './fixtures';

export function makePoemCollectionsScenario() {
	setTestAuthClient();
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {} as Record<string, unknown>,
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return scenario;
		},
		asAuthenticatedUser() {
			setTestAuthClient();
			return scenario;
		},
		asBannedUser() {
			setTestAuthClient({
				id: 123,
				role: 'author',
				status: 'banned',
			});
			return scenario;
		},
		withCollections(collections: PoemCollection[] = [poemCollection]) {
			seedCollections(queryClient, collections);
			scenario.mocks.getCollections = vi.spyOn(poems.getCollections, 'query').mockReturnValue({
				queryKey: poemKeys.collections(),
				queryFn: () => Promise.resolve(collections),
			});
			return scenario;
		},
		withCreateSuccess() {
			scenario.mocks.createCollection = vi
				.spyOn(poems.createCollection, 'mutate')
				.mockResolvedValue();
			return scenario;
		},
		withCreatePending() {
			let resolveCreate!: () => void;
			const promise = new Promise<void>((resolve) => {
				resolveCreate = resolve;
			});
			scenario.mocks.createCollection = vi
				.spyOn(poems.createCollection, 'mutate')
				.mockReturnValue(promise);
			scenario.mocks.resolveCreate = resolveCreate;
			return scenario;
		},
		withAddItemSuccess() {
			scenario.mocks.addItemToCollection = vi
				.spyOn(poems.addItemToCollection, 'mutate')
				.mockResolvedValue();
			return scenario;
		},
		withRemoveItemFailure(error: unknown = new Error('remove failed')) {
			scenario.mocks.removeItemFromCollection = vi
				.spyOn(poems.removeItemFromCollection, 'mutate')
				.mockRejectedValue(error);
			return scenario;
		},
		render(enabled = true) {
			return renderHook(() => usePoemCollections(enabled), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		getCollections() {
			return getCollections(queryClient);
		},
	};

	return scenario;
}

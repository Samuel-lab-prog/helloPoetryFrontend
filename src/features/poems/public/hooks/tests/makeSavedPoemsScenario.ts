import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { FullPoem, SavedPoem } from '@Api/poems/types';
import { registerPoemsCachePort } from '@root/core/ports/poems';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useSavedPoems } from '../useManageSavedPoems';
import { fullPoem, getPoemKey, getSavedPoems, poemId, seedPoem, seedSavedPoems } from './fixtures';

export function makeSavedPoemsScenario() {
	registerPoemsCachePort({
		getPoemKey,
	});
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
		withSavedPoems(savedPoems: SavedPoem[] = []) {
			seedSavedPoems(queryClient, savedPoems);
			scenario.mocks.getSavedPoems = vi.spyOn(poems.getSavedPoems, 'query').mockReturnValue({
				queryKey: poemKeys.saved(),
				queryFn: () => Promise.resolve(savedPoems),
			});
			return scenario;
		},
		withCachedPoem(poem: FullPoem = fullPoem) {
			seedPoem(queryClient, poem);
			return scenario;
		},
		withSaveSuccess() {
			scenario.mocks.savePoem = vi.spyOn(poems.savePoem, 'mutate').mockResolvedValue();
			return scenario;
		},
		withSavePending() {
			let resolveSave!: () => void;
			const promise = new Promise<void>((resolve) => {
				resolveSave = resolve;
			});
			scenario.mocks.savePoem = vi.spyOn(poems.savePoem, 'mutate').mockReturnValue(promise);
			scenario.mocks.resolveSave = resolveSave;
			return scenario;
		},
		withSaveFailure(error: unknown = new Error('save failed')) {
			scenario.mocks.savePoem = vi.spyOn(poems.savePoem, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		withUnsaveFailure(error: unknown = new Error('unsave failed')) {
			scenario.mocks.removeSavedPoem = vi
				.spyOn(poems.removeSavedPoem, 'mutate')
				.mockRejectedValue(error);
			return scenario;
		},
		render(enabled = true) {
			return renderHook(() => useSavedPoems(enabled), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		getSavedPoems() {
			return getSavedPoems(queryClient);
		},
		getCachedPoem(id = poemId) {
			return queryClient.getQueryData<FullPoem>(getPoemKey(id));
		},
	};

	return scenario;
}

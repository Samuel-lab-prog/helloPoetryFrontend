import { interactions } from '@Api/interactions/endpoints';
import type { FullPoem } from '@Api/poems/types';
import { registerPoemsCachePort } from '@root/core/ports/poems';
import {
	clearTestAuthClient,
	setTestAuthClient,
	setTestAuthStatus,
} from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { usePoemLike } from '../usePoemLike';
import { fullPoem, getPoemKey, likedPoemId, seedPoem } from './fixtures';

export function makePoemLikeScenario() {
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
			setTestAuthStatus('banned');
			return scenario;
		},
		withCachedPoem(poem: FullPoem = fullPoem) {
			seedPoem(queryClient, poem);
			return scenario;
		},
		withLikeSuccess() {
			scenario.mocks.likePoem = vi.spyOn(interactions.likePoem, 'mutate').mockResolvedValue();
			return scenario;
		},
		withLikeFailure(error: unknown = new Error('like failed')) {
			scenario.mocks.likePoem = vi.spyOn(interactions.likePoem, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		withUnlikeFailure(error: unknown = new Error('unlike failed')) {
			scenario.mocks.unlikePoem = vi
				.spyOn(interactions.unlikePoem, 'mutate')
				.mockRejectedValue(error);
			return scenario;
		},
		render(poemId = likedPoemId) {
			return renderHook(() => usePoemLike(poemId), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		getCachedPoem(poemId = likedPoemId) {
			return queryClient.getQueryData<FullPoem>(getPoemKey(poemId));
		},
	};

	return scenario;
}

import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { FullPoem } from '@Api/poems/types';
import { toaster } from '@BaseComponents';
import { registerPoemsCachePort } from '@root/core/ports/poems';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useDeletePoemForm } from '../useDeletePoemForm';
import { fullPoem, getPoemKey, poemId, seedDeleteCaches } from './fixtures';

export function makeDeletePoemFormScenario() {
	registerPoemsCachePort({ getPoemKey });
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {
			toaster: vi.spyOn(toaster, 'create').mockReturnValue('toast-id'),
		} as Record<string, unknown>,
		withCachedPoem() {
			seedDeleteCaches(queryClient);
			return scenario;
		},
		withDeleteSuccess() {
			scenario.mocks.deletePoem = vi.spyOn(poems.deletePoem, 'mutate').mockResolvedValue();
			return scenario;
		},
		withDeleteFailure(error: unknown) {
			scenario.mocks.deletePoem = vi.spyOn(poems.deletePoem, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(() => useDeletePoemForm(), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		getMyPoems() {
			return queryClient.getQueryData<FullPoem[]>(poemKeys.mine());
		},
		getPoem() {
			return queryClient.getQueryData<FullPoem>(getPoemKey(poemId));
		},
		expectedPoem: fullPoem,
	};

	return scenario;
}

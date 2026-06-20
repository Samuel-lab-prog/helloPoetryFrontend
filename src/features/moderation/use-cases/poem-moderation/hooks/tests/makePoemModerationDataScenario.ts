import { moderation } from '@Api/moderation/endpoints';
import { moderationKeys } from '@Api/moderation/keys';
import type { ModerationPoem } from '@Api/moderation/types';
import { poems } from '@Api/poems/endpoints';
import { toaster } from '@BaseComponents';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { usePoemModerationData } from '../usePoemModerationData';
import { pendingPoem } from './fixtures';

export function makePoemModerationDataScenario() {
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {
			toaster: vi.spyOn(toaster, 'create').mockReturnValue('toast-id'),
			invalidatePoem: vi.spyOn(poems.getPoem, 'invalidate').mockResolvedValue(),
		} as Record<string, unknown>,
		withPendingPoems(poemsList: ModerationPoem[] = [pendingPoem]) {
			queryClient.setQueryData(moderationKeys.pendingPoems(), poemsList);
			scenario.mocks.getPendingPoems = vi
				.spyOn(moderation.getPendingPoems, 'query')
				.mockReturnValue({
					queryKey: moderationKeys.pendingPoems(),
					queryFn: () => Promise.resolve(poemsList),
				});
			return scenario;
		},
		withModerationSuccess() {
			scenario.mocks.moderatePoem = vi
				.spyOn(moderation.moderatePoem, 'mutate')
				.mockResolvedValue({
					id: pendingPoem.id,
					moderationStatus: 'approved',
				});
			return scenario;
		},
		withModerationFailure(error: unknown = new Error('moderation failed')) {
			scenario.mocks.moderatePoem = vi
				.spyOn(moderation.moderatePoem, 'mutate')
				.mockRejectedValue(error);
			return scenario;
		},
		render(enabled = true) {
			return renderHook(() => usePoemModerationData(enabled), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
	};

	return scenario;
}

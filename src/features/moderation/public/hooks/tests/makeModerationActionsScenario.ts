import { moderation } from '@Api/moderation/endpoints';
import { toaster } from '@BaseComponents';
import { queryClient } from '@QueryClient';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useModerationActions } from '../useModerationActions';

export function makeModerationActionsScenario() {
	const hookQueryClient = createTestQueryClient();
	const onActionComplete = vi.fn();
	const scenario = {
		queryClient: hookQueryClient,
		mocks: {
			onActionComplete,
			invalidateQueries: vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(),
			toaster: vi.spyOn(toaster, 'create').mockReturnValue('toast-id'),
		} as Record<string, unknown>,
		withBanSuccess() {
			scenario.mocks.banUser = vi.spyOn(moderation.banUser, 'mutate').mockResolvedValue({
				id: 1,
				moderatorId: 10,
				bannedUserId: 77,
				reason: 'repeated abuse',
				bannedAt: '2026-06-20T12:00:00.000Z',
			});
			return scenario;
		},
		withPoemModerationSuccess() {
			scenario.mocks.moderatePoem = vi
				.spyOn(moderation.moderatePoem, 'mutate')
				.mockResolvedValue({
					id: 44,
					moderationStatus: 'approved',
				});
			return scenario;
		},
		withPoemModerationFailure(error: unknown = new Error('moderation failed')) {
			scenario.mocks.moderatePoem = vi
				.spyOn(moderation.moderatePoem, 'mutate')
				.mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(
				() =>
					useModerationActions({
						onActionComplete,
					}),
				{
					wrapper: createQueryClientWrapper(hookQueryClient),
				},
			);
		},
	};

	return scenario;
}

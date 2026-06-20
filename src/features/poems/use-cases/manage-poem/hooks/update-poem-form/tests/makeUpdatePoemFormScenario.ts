import { poems } from '@Api/poems/endpoints';
import { toaster } from '@BaseComponents';
import { setTestAuthClient } from '@root/core/testing/authClientStore';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useUpdatePoemForm } from '../useUpdatePoemForm';

export function makeUpdatePoemFormScenario() {
	setTestAuthClient();
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {
			invalidateQueries: vi.spyOn(queryClient, 'invalidateQueries'),
			toaster: vi.spyOn(toaster, 'create').mockReturnValue('toast-id'),
		} as Record<string, unknown>,
		asModerator() {
			setTestAuthClient({
				id: 123,
				role: 'moderator',
				status: 'active',
			});
			return scenario;
		},
		withUpdateSuccess() {
			scenario.mocks.updatePoem = vi.spyOn(poems.updatePoem, 'mutate').mockResolvedValue({
				id: 44,
				title: 'Updated title',
				slug: 'updated-title',
				content: 'This is updated poem content.',
				excerpt: 'Updated summary',
				tags: [{ id: 1, name: 'updated' }],
				visibility: 'public',
				status: 'draft',
				isCommentable: true,
				createdAt: new Date('2026-06-20T12:00:00.000Z'),
				updatedAt: new Date('2026-06-20T12:00:00.000Z'),
				toUserIds: [],
				mentionedUserIds: [],
				audioUrl: null,
			});
			return scenario;
		},
		withUpdateFailure(error: unknown) {
			scenario.mocks.updatePoem = vi.spyOn(poems.updatePoem, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(() => useUpdatePoemForm(), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
	};

	return scenario;
}

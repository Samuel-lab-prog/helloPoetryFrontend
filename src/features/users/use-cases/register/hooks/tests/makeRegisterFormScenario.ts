import { users } from '@Api/users/endpoints';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import * as avatarUpload from '../../../../internal/utils/avatarUpload';
import { useRegisterForm } from '../useRegisterForm';

export function makeRegisterFormScenario() {
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {} as Record<string, unknown>,
		withAvatarUploadSuccess(url = 'https://example.com/avatar.png') {
			scenario.mocks.uploadAvatarFile = vi
				.spyOn(avatarUpload, 'uploadAvatarFile')
				.mockResolvedValue(url);
			return scenario;
		},
		withAvatarUploadFailure(message = "We couldn't upload your avatar.") {
			scenario.mocks.uploadAvatarFile = vi
				.spyOn(avatarUpload, 'uploadAvatarFile')
				.mockRejectedValue(new Error(message));
			return scenario;
		},
		withRegisterSuccess() {
			scenario.mocks.createUser = vi.spyOn(users.createUser, 'mutate').mockResolvedValue({
				id: 123,
				name: 'New Poet',
				nickname: 'new_poet',
				bio: 'A new profile',
				avatarUrl: 'https://example.com/avatar.png',
				role: 'author',
				status: 'active',
				poems: [],
				stats: {
					poemsCount: 0,
					commentsCount: 0,
					friendsCount: 0,
				},
				isFriend: false,
				hasBlockedRequester: false,
				isBlockedByRequester: false,
				isFriendRequester: false,
				hasIncomingFriendRequest: false,
			});
			return scenario;
		},
		withRegisterFailure(error: unknown) {
			scenario.mocks.createUser = vi.spyOn(users.createUser, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(() => useRegisterForm(), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
	};

	return scenario;
}

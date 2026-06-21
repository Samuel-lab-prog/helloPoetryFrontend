import { users } from '@Api/users/endpoints';
import type { UserPrivateProfile } from '@root/core/api/users/types';
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

import * as avatarUpload from '../../../../internal/utils/avatarUpload';
import { useUpdateMyProfile } from '../useUpdateMyProfile';
import { getProfileKey, privateProfile, seedPrivateProfile } from './fixtures';

export function makeUpdateMyProfileScenario() {
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
		withCachedProfile(profile: UserPrivateProfile = privateProfile) {
			seedPrivateProfile(queryClient, profile);
			return scenario;
		},
		withAvatarUploadSuccess(url = 'https://example.com/new-avatar.png') {
			scenario.mocks.uploadAvatarFile = vi
				.spyOn(avatarUpload, 'uploadAvatarFile')
				.mockResolvedValue(url);
			return scenario;
		},
		withUpdateSuccess() {
			scenario.mocks.updateUser = vi.spyOn(users.updateUser, 'mutate').mockResolvedValue();
			return scenario;
		},
		withUpdateFailure(error: unknown = new Error('update failed')) {
			scenario.mocks.updateUser = vi.spyOn(users.updateUser, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(() => useUpdateMyProfile(), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
		getCachedProfile() {
			return queryClient.getQueryData<UserPrivateProfile>(getProfileKey());
		},
	};

	return scenario;
}

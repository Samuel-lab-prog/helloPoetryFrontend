import { type AppErrorType } from '@BaseComponents';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { users } from '@root/features/users/api/endpoints';
import { userKeys } from '@root/features/users/api/keys';
import type { UserPrivateProfile } from '@root/features/users/api/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadAvatarFile } from '../../../internal/utils/avatarUpload';

type UpdateMyProfileInput = {
	name?: string;
	nickname?: string;
	bio?: string;
	avatarUrl?: string;
	avatarFile?: File | null;
};

type ConflictField = 'nickname' | null;

export function useUpdateMyProfile() {
	const queryClient = useQueryClient();
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);
	const profileKey = clientId
		? userKeys.profile(String(clientId))
		: (['users', 'profile'] as const);

	const mutation = useMutation({
		mutationFn: async (data: UpdateMyProfileInput) => {
			const nextAvatarUrl = data.avatarFile
				? await uploadAvatarFile(data.avatarFile)
				: data.avatarUrl;

			await users.updateUser.mutate({
				id: String(clientId),
				name: data.name,
				nickname: data.nickname,
				bio: data.bio,
				avatarUrl: nextAvatarUrl,
			});

			return { avatarUrl: nextAvatarUrl };
		},
		onSuccess: (result, variables) => {
			const existing = queryClient.getQueryData<UserPrivateProfile>(profileKey);
			if (existing) {
				queryClient.setQueryData<UserPrivateProfile>(profileKey, {
					...existing,
					name: variables.name ?? existing.name,
					nickname: variables.nickname ?? existing.nickname,
					bio: variables.bio ?? existing.bio,
					avatarUrl: result?.avatarUrl ?? existing.avatarUrl,
				});
			}
			queryClient.invalidateQueries({ queryKey: profileKey });
		},
	});

	function getErrorMessage() {
		const error = mutation.error as AppErrorType | Error | null;
		if (!error) return '';
		if (!('statusCode' in error)) return error.message || 'Error updating profile.';
		if (error.statusCode === 401) return 'Sign in to edit your profile.';
		if (error.statusCode === 403) return 'You do not have permission to edit this profile.';
		if (error.statusCode === 409) return 'This nickname is already in use.';
		if (error.statusCode === 422) return 'Invalid data. Please review the fields.';
		return 'Error updating profile.';
	}

	function getConflictField(): ConflictField {
		const error = mutation.error as AppErrorType | null;
		if (!error || error.statusCode !== 409) return null;
		const message = error.message?.toLowerCase() ?? '';
		if (message.includes('nickname') || message.includes('apelido')) {
			return 'nickname';
		}
		return null;
	}

	return {
		updateMyProfile: mutation.mutateAsync,
		isUpdatingProfile: mutation.isPending,
		updateProfileError: getErrorMessage(),
		conflictField: getConflictField(),
		canEditProfile: !!clientId,
	};
}

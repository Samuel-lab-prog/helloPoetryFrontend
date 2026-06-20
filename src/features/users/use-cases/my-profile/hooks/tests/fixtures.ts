import { userKeys } from '@Api/users/keys';
import type { UserPrivateProfile } from '@Api/users/types';
import type { QueryClient } from '@tanstack/react-query';

export const privateProfile: UserPrivateProfile = {
	id: 123,
	nickname: 'poet',
	name: 'Poet Name',
	bio: 'Short bio',
	avatarUrl: 'https://example.com/old-avatar.png',
	role: 'author',
	status: 'active',
	email: 'poet@example.com',
	emailVerifiedAt: null,
	unreadNotificationsCount: 0,
	poems: [],
	stats: {
		poems: [],
		commentsIds: [],
		friends: [],
	},
	blockedUsersIds: [],
};

export function getProfileKey(profileId = privateProfile.id) {
	return userKeys.profile(String(profileId));
}

export function seedPrivateProfile(
	queryClient: QueryClient,
	profile: UserPrivateProfile = privateProfile,
) {
	queryClient.setQueryData(getProfileKey(profile.id), profile);
}

export function avatarFile() {
	return new File(['avatar'], 'avatar.png', { type: 'image/png' });
}

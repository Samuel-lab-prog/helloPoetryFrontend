import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useQuery } from '@tanstack/react-query';

type MyProfileType = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	role: string;
	status: string;
	email: string;
	emailVerifiedAt: string | null;
	unreadNotificationsCount: number;
	stats: {
		poems: {
			id: number;
			title: string;
		}[];
		commentsIds: number[];
		friends: {
			id: number;
		}[];
	};
	blockedUsersIds: number[];
};

export function useMyProfile() {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: userKeys.profile(String(clientId)),
		enabled: !!clientId,
		staleTime: Infinity,
		queryFn: () => users.getProfile.query(String(clientId)).queryFn() as Promise<MyProfileType>,
	});

	return {
		profile: query.data,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		isMissingClient: !clientId,
		refetch: query.refetch,
	};
}

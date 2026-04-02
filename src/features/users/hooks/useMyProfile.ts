import { useQuery } from '@tanstack/react-query';
import { useAuthClientStore } from '@root/features/auth/public/stores/useAuthClientStore';
import { api, apiKeys } from '@root/core/api';

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
		queryKey: apiKeys.users.profile(String(clientId)),
		enabled: !!clientId,
		staleTime: Infinity,
		queryFn: () => api.users.getProfile.query(String(clientId)).queryFn() as Promise<MyProfileType>,
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

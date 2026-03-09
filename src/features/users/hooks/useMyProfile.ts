import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';
import { useAuthClientStore } from '@features/auth';

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
	stats: {
		poems: {
			id: number;
			title: string;
		}[];
		friends: {
			id: number;
		}[];
	};
	blockedUsersIds: number[];
};

export function useMyProfile() {
	const clientId = useAuthClientStore((state) => state.authClient?.id ?? null);

	const query = useQuery({
		queryKey: ['my-profile', clientId],
		enabled: !!clientId,
		staleTime: Infinity,
		queryFn: () =>
			createHTTPRequest<MyProfileType>({
				path: '/users',
				params: [clientId!, 'profile'],
			}),
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

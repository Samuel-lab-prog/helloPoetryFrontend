import { useQuery } from '@tanstack/react-query';
import { createHTTPRequest } from '@features/base';

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
		poemsIds: number[];
		commentsIds: number[];
		friendsIds: number[];
	};
	friendshipRequestsReceived: {
		requesterId: number;
		requesterNickname: string;
		requesterAvatarUrl: string | null;
	}[];
	friendshipRequestsSent: {
		addresseeId: number;
		addresseeNickname: string;
		addresseeAvatarUrl: string | null;
	}[];
	blockedUsersIds: number[];
};

function getClientId() {
	try {
		const raw = localStorage.getItem('auth-client');
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { id?: number };
		return parsed.id ?? null;
	} catch {
		return null;
	}
}

export function useMyProfile() {
	const clientId = getClientId();

	const query = useQuery({
		queryKey: ['my-profile', clientId],
		enabled: !!clientId,
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

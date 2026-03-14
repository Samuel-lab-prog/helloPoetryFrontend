import { createQueryKeys } from '../utils';

export const userKeys = createQueryKeys({
	all: () => ['users'] as const,
	search: (params: {
		limit?: number;
		cursor?: string;
		orderBy: 'nickname' | 'createdAt' | 'id';
		orderDirection: 'asc' | 'desc';
		searchNickname?: string;
	}) => ['users', 'search', params] as const,
	profile: (id: string) => ['users', 'profile', id] as const,
	checkNickname: (nickname: string) => ['users', 'check-nickname', nickname] as const,
	checkEmail: (email: string) => ['users', 'check-email', email] as const,
});

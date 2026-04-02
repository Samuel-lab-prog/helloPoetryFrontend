import { createQueryKeys } from '../../../core/api/utils';

export const userKeys = createQueryKeys({
	all: () => ['users'] as const,
	search: (params: {
		limit?: number;
		cursor?: string;
		orderBy?: 'nickname' | 'createdAt' | 'id';
		orderDirection?: 'asc' | 'desc';
		searchNickname?: string;
	}) => ['users', 'search', params] as const,
	publicSearch: (params: { limit?: number; searchNickname?: string }) =>
		['users', 'public', params] as const,
	preview: (params: { limit?: number; searchNickname?: string }) =>
		['users', 'preview', params] as const,
	profile: (id: string) => ['users', 'profile', id] as const,
	checkNickname: (nickname: string) => ['users', 'check-nickname', nickname] as const,
	checkEmail: (email: string) => ['users', 'check-email', email] as const,
	anyProfile: () => ['users', 'profile'] as const,
	anySearch: () => ['users', 'search'] as const,
});

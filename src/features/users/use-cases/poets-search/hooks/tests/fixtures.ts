import type { UsersPage } from '@Api/users/types';

export const usersPage: UsersPage = {
	hasMore: false,
	users: [
		{
			id: 1,
			name: 'Public Poet',
			nickname: 'public-poet',
			avatarUrl: null,
			role: 'author',
		},
	],
};

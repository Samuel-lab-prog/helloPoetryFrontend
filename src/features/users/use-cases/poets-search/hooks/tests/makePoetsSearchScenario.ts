import { users } from '@Api/users/endpoints';
import { userKeys } from '@Api/users/keys';
import type { UsersPage } from '@Api/users/types';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { usePoetsSearch } from '../usePoetsSearch';
import { usersPage } from './fixtures';

function mockPublicUsersQuery(page: UsersPage = usersPage) {
	return vi.spyOn(users.getPublicUsers, 'query').mockImplementation((params) => ({
		queryKey: userKeys.publicSearch(params),
		queryFn: () => Promise.resolve(page),
	}));
}

export function makePoetsSearchScenario() {
	const queryClient = createTestQueryClient();
	const scenario = {
		queryClient,
		mocks: {} as Record<string, unknown>,
		withPublicUsers(page: UsersPage = usersPage) {
			scenario.mocks.getPublicUsers = mockPublicUsersQuery(page);
			return scenario;
		},
		render(searchNickname: string, limit?: number) {
			return renderHook(() => usePoetsSearch(searchNickname, limit), {
				wrapper: createQueryClientWrapper(queryClient),
			});
		},
	};

	return scenario;
}

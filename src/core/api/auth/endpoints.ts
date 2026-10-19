import { createMutationEndpoint } from '@Api/utils';
import { createHTTPRequest } from '@Utils';

import type { AuthClient, LoginBody } from './types';

const login = createMutationEndpoint<LoginBody, AuthClient>({
	fn: (data) =>
		createHTTPRequest<AuthClient, LoginBody>({
			method: 'POST',
			path: `/auth/login`,
			body: data,
		}),
});

const bootstrapCsrfToken = () =>
	createHTTPRequest<{ csrfToken: string }>({
		method: 'GET',
		path: `/auth/csrf`,
	});

const logout = createMutationEndpoint<void, { success: true }>({
	fn: () =>
		createHTTPRequest<{ success: true }>({
			method: 'POST',
			path: '/auth/logout',
		}),
});

export const auth = {
	login,
	bootstrapCsrfToken,
	logout,
};

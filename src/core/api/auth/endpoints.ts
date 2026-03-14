import { createHTTPRequest } from '@root/features/base';
import { createMutationEndpoint } from '../utils';
import type { AuthClient, LoginBody } from './types';

const login = createMutationEndpoint<LoginBody, AuthClient>({
	fn: (data) =>
		createHTTPRequest<AuthClient, LoginBody>({
			method: 'POST',
			path: `/auth/login`,
			body: data,
		}),
});

export const auth = {
	login,
};

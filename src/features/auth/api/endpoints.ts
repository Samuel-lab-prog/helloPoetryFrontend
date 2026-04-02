import { createHTTPRequest } from '@core/base/utils/createHttpRequest';
import { createMutationEndpoint } from '@core/api/utils';
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

import type { AuthClient } from '@Api/auth/types';

import type { LoginDataType } from '../../schemas/loginSchema';

export const loginData: LoginDataType = {
	email: 'poet@example.com',
	password: 'correct-password',
};

export const authClient: AuthClient = {
	id: 123,
	role: 'author',
	status: 'active',
};

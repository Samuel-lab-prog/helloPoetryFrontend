import { createHTTPRequest } from '@features/base';

export async function checkEmailAvailability(email: string): Promise<string | null> {
	if (!email || email.length < 5) return null;

	const inUse = await createHTTPRequest<boolean>({
		path: '/users/check-email',
		query: { email: String(email) },
		method: 'GET',
	});

	return inUse ? 'E-mail já está em uso' : null;
}

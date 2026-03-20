import { api } from '@root/core/api';

export async function checkEmailAvailability(email: string): Promise<string | null> {
	if (!email || email.length < 5) return null;

	const inUse = await api.users.checkEmail.fetch(String(email));

	return inUse ? 'Email is already in use' : null;
}

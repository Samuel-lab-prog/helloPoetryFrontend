import { createHTTPRequest } from '@features/base';
import { REGISTER_NICKNAME_MIN_LENGTH } from '../../schemas/constants';

export async function checkNicknameAvailability(nickname: string): Promise<string | null> {
	if (!nickname || nickname.length < REGISTER_NICKNAME_MIN_LENGTH) return null;

	const inUse = await createHTTPRequest<boolean>({
		path: '/users/check-nickname',
		query: { nickname: String(nickname) },
		method: 'GET',
	});

	return inUse ? 'Apelido já está em uso' : null;
}

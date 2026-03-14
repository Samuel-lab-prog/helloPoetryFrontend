import { api } from '@root/core/api';

export async function checkNicknameAvailability(nickname: string): Promise<string | null> {
	if (!nickname || nickname.length < 3) return null;

	const inUse = await api.users.checkNickname.fetch(String(nickname));

	return inUse ? 'Apelido j� est� em uso' : null;
}

import { users } from '../../../api/endpoints';

export async function checkNicknameAvailability(nickname: string): Promise<string | null> {
	if (!nickname || nickname.length < 3) return null;

	const inUse = await users.checkNickname.fetch(String(nickname));

	return inUse ? 'Nickname is already in use' : null;
}

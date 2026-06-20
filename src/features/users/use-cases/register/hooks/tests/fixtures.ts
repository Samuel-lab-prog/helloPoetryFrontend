import type { RegisterDataType } from '../../schemas/registerSchema';

export const registerData: RegisterDataType = {
	name: 'New Poet',
	nickname: 'new_poet',
	email: 'new-poet@example.com',
	password: 'strong-password',
	bio: 'A new profile',
	avatar: null,
};

export function avatarFile() {
	return new File(['avatar'], 'avatar.png', { type: 'image/png' });
}

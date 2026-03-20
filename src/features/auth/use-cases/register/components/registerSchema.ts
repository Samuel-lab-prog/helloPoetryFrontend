import { z } from 'zod';
import { findForbiddenWords } from '@root/core/base';
import {
	REGISTER_BIO_MAX_LENGTH,
	REGISTER_BIO_MIN_LENGTH,
	REGISTER_NAME_MAX_LENGTH,
	REGISTER_NAME_MIN_LENGTH,
	REGISTER_NICKNAME_MAX_LENGTH,
	REGISTER_NICKNAME_MIN_LENGTH,
	REGISTER_PASSWORD_MAX_LENGTH,
	REGISTER_PASSWORD_MIN_LENGTH,
} from '../constants';

export const registerSchema = z
	.object({
		nickname: z
			.string()
			.trim()
			.min(
				REGISTER_NICKNAME_MIN_LENGTH,
				`Nickname must be at least ${REGISTER_NICKNAME_MIN_LENGTH} characters`,
			)
			.max(
				REGISTER_NICKNAME_MAX_LENGTH,
				`Nickname must be at most ${REGISTER_NICKNAME_MAX_LENGTH} characters`,
			)
			.regex(/^[a-zA-Z0-9_]+$/, 'Nickname can contain only letters, numbers, and underscores'),
		name: z
			.string()
			.trim()
			.min(REGISTER_NAME_MIN_LENGTH, `Name must be at least ${REGISTER_NAME_MIN_LENGTH} characters`)
			.max(REGISTER_NAME_MAX_LENGTH, `Name must be at most ${REGISTER_NAME_MAX_LENGTH} characters`),
		email: z.email('Invalid email').trim(),
		password: z
			.string()
			.min(
				REGISTER_PASSWORD_MIN_LENGTH,
				`Password must be at least ${REGISTER_PASSWORD_MIN_LENGTH} characters`,
			)
			.max(
				REGISTER_PASSWORD_MAX_LENGTH,
				`Password must be at most ${REGISTER_PASSWORD_MAX_LENGTH} characters`,
			),
		bio: z
			.string()
			.trim()
			.min(REGISTER_BIO_MIN_LENGTH, `Bio must be at least ${REGISTER_BIO_MIN_LENGTH} characters`)
			.max(REGISTER_BIO_MAX_LENGTH, `Bio must be at most ${REGISTER_BIO_MAX_LENGTH} characters`),
		avatar: z.any().optional().nullable(),
	})
	.superRefine((data, ctx) => {
		const fields: Array<{ key: 'nickname' | 'name' | 'bio'; value: string }> = [
			{ key: 'nickname', value: data.nickname },
			{ key: 'name', value: data.name },
			{ key: 'bio', value: data.bio },
		];

		for (const field of fields) {
			const forbiddenWordsFound = findForbiddenWords(field.value);
			if (forbiddenWordsFound.length === 0) continue;

			ctx.addIssue({
				code: 'custom',
				path: [field.key],
				message: `Remove forbidden words: ${forbiddenWordsFound.join(', ')}`,
			});
		}
	});

export type RegisterDataType = z.infer<typeof registerSchema>;

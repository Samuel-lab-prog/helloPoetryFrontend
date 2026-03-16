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
} from './constants';

export const registerSchema = z
	.object({
		nickname: z
			.string()
			.trim()
			.min(
				REGISTER_NICKNAME_MIN_LENGTH,
				`Apelido deve ter pelo menos ${REGISTER_NICKNAME_MIN_LENGTH} caracteres`,
			)
			.max(
				REGISTER_NICKNAME_MAX_LENGTH,
				`Apelido deve ter no máximo ${REGISTER_NICKNAME_MAX_LENGTH} caracteres`,
			)
			.regex(/^[a-zA-Z0-9_]+$/, 'Apelido pode conter apenas letras, números e underscores'),
		name: z
			.string()
			.trim()
			.min(
				REGISTER_NAME_MIN_LENGTH,
				`Nome deve ter pelo menos ${REGISTER_NAME_MIN_LENGTH} caracteres`,
			)
			.max(
				REGISTER_NAME_MAX_LENGTH,
				`Nome deve ter no máximo ${REGISTER_NAME_MAX_LENGTH} caracteres`,
			),
		email: z.email('E-mail inválido').trim(),
		password: z
			.string()
			.min(
				REGISTER_PASSWORD_MIN_LENGTH,
				`A senha deve ter pelo menos ${REGISTER_PASSWORD_MIN_LENGTH} caracteres`,
			)
			.max(
				REGISTER_PASSWORD_MAX_LENGTH,
				`A senha deve ter no máximo ${REGISTER_PASSWORD_MAX_LENGTH} caracteres`,
			),
		bio: z
			.string()
			.trim()
			.min(REGISTER_BIO_MIN_LENGTH, `Bio deve ter pelo menos ${REGISTER_BIO_MIN_LENGTH} caracteres`)
			.max(REGISTER_BIO_MAX_LENGTH, `Bio deve ter no máximo ${REGISTER_BIO_MAX_LENGTH} caracteres`),
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
				message: `Remova palavras proibidas: ${forbiddenWordsFound.join(', ')}`,
			});
		}
	});

export type RegisterDataType = z.infer<typeof registerSchema>;

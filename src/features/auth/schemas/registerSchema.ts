import { z } from 'zod';

export const registerSchema = z.object({
	nickname: z
		.string()
		.trim()
		.min(3, 'Apelido deve ter pelo menos 3 caracteres')
		.max(30, 'Apelido deve ter no máximo 30 caracteres')
		.regex(
			/^[a-zA-Z0-9_]+$/,
			'Apelido pode conter apenas letras, números e underscores',
		),
	name: z
		.string()
		.trim()
		.min(3, 'Nome deve ter pelo menos 3 caracteres')
		.max(30, 'Nome deve ter no máximo 30 caracteres'),
	email: z.email('E-mail inválido').trim(),
	password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
	bio: z.string().trim(),
	avatarUrl: z.url('URL inválida').optional(),
});

export type RegisterDataType = z.infer<typeof registerSchema>;

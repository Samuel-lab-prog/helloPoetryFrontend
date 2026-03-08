import { z } from 'zod';

export const registerSchema = z.object({
	nickname: z.string().trim().min(1, 'Apelido é obrigatório'),
	name: z.string().trim().min(1, 'Nome é obrigatório'),
	email: z
		.string()
		.trim()
		.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),
	password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
	bio: z.string().trim().min(1, 'Bio é obrigatória'),
	avatarUrl: z.url('URL inválida').optional(),
});

export type RegisterDataType = z.infer<typeof registerSchema>;

import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido'),
	password: z.string(),
});

export type LoginDataType = z.infer<typeof loginSchema>;

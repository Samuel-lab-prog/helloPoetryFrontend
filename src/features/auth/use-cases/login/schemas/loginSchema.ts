import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('Invalid email').trim(),
	password: z.string().min(1, 'Password is required.'),
});

export type LoginDataType = z.infer<typeof loginSchema>;

import { z } from 'zod';

export const loginSchema = z.object({
	email: z.email('Invalid email'),
	password: z.string(),
});

export type LoginDataType = z.infer<typeof loginSchema>;

import { z } from 'zod';

export const registerSchema = z.object({
	nickname: z.string().trim().min(1, 'Nickname is required'),
	name: z.string().trim().min(1, 'Name is required'),
	email: z
		.string()
		.trim()
		.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
	password: z.string().min(6, 'Password must have at least 6 characters'),
	bio: z.string().trim().min(1, 'Bio is required'),
});

export type RegisterDataType = z.infer<typeof registerSchema>;

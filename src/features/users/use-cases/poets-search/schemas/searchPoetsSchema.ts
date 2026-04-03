import { z } from 'zod';

export const searchPoetsSchema = z.object({
	searchNickname: z.string(),
});

export type SearchPoetsForm = z.infer<typeof searchPoetsSchema>;

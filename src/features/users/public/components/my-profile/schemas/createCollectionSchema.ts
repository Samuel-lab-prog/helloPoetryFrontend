import { z } from 'zod';

export const createCollectionSchema = z.object({
	name: z
		.string()
		.trim()
		.min(3, 'Collection name must be at least 3 characters')
		.max(60, 'Collection name must be at most 60 characters'),
	description: z.string().trim().max(200, 'Collection description must be at most 200 characters'),
});

export type CreateCollectionFormValues = z.infer<typeof createCollectionSchema>;

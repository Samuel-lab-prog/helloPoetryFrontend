import { z } from 'zod';

export const createPostSchema = z.object({
	title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
	excerpt: z.string().min(10, 'O resumo deve ter pelo menos 10 caracteres'),
	content: z.string().min(100, 'O conteúdo deve ter pelo menos 100 caracteres'),
	// We gonna treat tags as a comma-separated string in the form and convert it to an array in the hook
	tags: z.array(z.string().min(1, 'Tag inválida')).optional(),
	status: z.enum(['draft', 'published']),
});
export const deletePostSchema = z.object({
	id: z.number('ID inválido').min(1, 'ID deve ser um numero positivo'),
});
export const updatePostSchema = createPostSchema.extend({
	id: z.number('ID inválido').min(1, 'ID deve ser um numero positivo'),
});

export type CreatePostType = z.infer<typeof createPostSchema>;
export type DeletePostType = z.infer<typeof deletePostSchema>;
export type UpdatePostType = z.infer<typeof updatePostSchema>;

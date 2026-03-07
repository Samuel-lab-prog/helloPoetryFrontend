import { z } from 'zod';

export const createPoemSchema = z.object({
	title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres'),
	excerpt: z.string().min(10, 'O resumo deve ter pelo menos 10 caracteres'),
	content: z.string().min(100, 'O conteúdo deve ter pelo menos 100 caracteres'),
	tags: z.array(z.string().min(1, 'Tag invalida')).optional(),
	status: z.enum(['draft', 'published']),
	visibility: z.enum(['public', 'friends', 'private', 'unlisted']),
	isCommentable: z.boolean(),
	toUserIds: z
		.array(z.number().int().positive('ID de usuário inválido'))
		.max(5, 'Você pode dedicar para no máximo 5 usuários')
		.optional(),
});

export const deletePoemSchema = z.object({
	id: z.number('ID inválido').min(1, 'ID deve ser um numero positivo'),
});

export const updatePoemSchema = createPoemSchema.extend({
	id: z.number('ID inválido').min(1, 'ID deve ser um numero positivo'),
});

export type CreatePoemType = z.infer<typeof createPoemSchema>;
export type DeletePoemType = z.infer<typeof deletePoemSchema>;
export type UpdatePoemType = z.infer<typeof updatePoemSchema>;

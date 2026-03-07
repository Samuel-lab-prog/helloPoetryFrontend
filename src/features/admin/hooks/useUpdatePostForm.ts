import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AppError, createHTTPRequest } from '@features/base';
import { updatePostSchema, type UpdatePostType } from '../schemas/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdatePostForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<UpdatePostType>({
		resolver: zodResolver(updatePostSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useUpdatePost();

	async function onSubmit(data: UpdatePostType) {
		try {
			queryClient.invalidateQueries({ queryKey: ['posts-minimal'] }); // Invalidate to refresh posts list
			queryClient.invalidateQueries({ queryKey: ['post', data.id] }); // Invalidate to refresh the specific post
			await mutateAsync(data);
			alert('Post atualizado com sucesso!');
		} catch (err) {
			handleUpdatePostError(err, form.setError, setGeneralError);
		}
	}

	return {
		handleSubmit: form.handleSubmit,
		reset: form.reset,
		formState: form.formState,
		control: form.control,
		watch: form.watch,
		onSubmit,
		isPending,
		generalError,
	};
}

function handleUpdatePostError(
	err: unknown,
	setError: UseFormSetError<UpdatePostType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppError;
	const status = error?.statusCode;
	const message = error?.errorMessages?.join(' ');

	if (status === 401) {
		setGeneralError('Você não tem permissão para criar posts.');
		return;
	}

	if (status === 409 && message?.includes('slug')) {
		setError('title', {
			type: 'manual',
			message: 'Já existe um post com esse novo título.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao atualizar post. Tente novamente mais tarde.');
}

function useUpdatePost() {
	return useMutation({
		mutationFn: (updatedPost: UpdatePostType) =>
			createHTTPRequest<{ id: number }, Omit<UpdatePostType, 'id'>>({
				path: '/posts',
				params: [Number(updatedPost.id)],
				method: 'PATCH',
				body: {
					title: updatedPost.title,
					excerpt: updatedPost.excerpt,
					content: updatedPost.content,
					tags: updatedPost.tags,
					status: updatedPost.status,
				},
			}),
	});
}

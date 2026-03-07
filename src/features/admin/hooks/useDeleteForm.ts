import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePostSchema, type DeletePostType } from '../schemas/schemas';
import { type AppError, createHTTPRequest } from '@features/base';

export function useDeletePostForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<DeletePostType>({
		resolver: zodResolver(deletePostSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useDeletePost();

	async function onSubmit(data: DeletePostType) {
		try {
			await mutateAsync(data.id);
			alert('Post deletado com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['posts-minimal'] }); // Invalidates for updated posts list
			form.reset();
		} catch (err) {
			handleDeletePostError(err, setGeneralError);
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

function useDeletePost() {
	return useMutation({
		mutationFn: (postId: number) =>
			createHTTPRequest<{ id: number }>({
				path: '/posts',
				params: [postId],
				method: 'DELETE',
			}),
	});
}

function handleDeletePostError(
	err: unknown,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppError;
	const status = error?.statusCode;

	if (status === 401) {
		setGeneralError('Você não tem permissão para criar posts.');
		return;
	}

	if (status === 404) {
		setGeneralError('Post não encontrado.');
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao deletar post. Tente novamente mais tarde.');
}

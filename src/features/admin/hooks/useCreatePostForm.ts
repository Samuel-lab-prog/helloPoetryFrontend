import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, type CreatePostType } from '../schemas/schemas';
import { useMutation } from '@tanstack/react-query';
import { createHTTPRequest, type AppError } from '@features/base';

export function useCreatePostForm() {
	const [generalError, setGeneralError] = useState('');

	const form = useForm<CreatePostType>({
		resolver: zodResolver(createPostSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useCreatePost();

	async function onSubmit(data: CreatePostType) {
		try {
			await mutateAsync(data);
			alert('Post criado com sucesso!');
		} catch (err) {
			handleCreatePostError(err, form.setError, setGeneralError);
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

function handleCreatePostError(
	err: unknown,
	setError: UseFormSetError<CreatePostType>,
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
			message: 'Já existe um post com esse título.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao criar post. Tente novamente mais tarde.');
}
function useCreatePost() {
	return useMutation({
		mutationFn: (newPost: CreatePostType) =>
			createHTTPRequest<{ id: number }, CreatePostType>({
				path: '/posts',
				method: 'POST',
				body: newPost,
			}),
	});
}

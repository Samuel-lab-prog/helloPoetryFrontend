import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, type CreatePostType } from '../schemas/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppError } from '@features/base';

export function useCreatePostForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<CreatePostType>({
		resolver: zodResolver(createPostSchema),
		mode: 'onChange',
		defaultValues: {
			status: 'draft',
			visibility: 'public',
			isCommentable: true,
			tags: [],
			toUserIds: [],
		},
	});

	const { mutateAsync, isPending } = useCreatePost();

	async function onSubmit(data: CreatePostType) {
		try {
			await mutateAsync(data);
			queryClient.invalidateQueries({ queryKey: ['poems-minimal'] });
			queryClient.invalidateQueries({ queryKey: ['poems'] });
			alert('Poema criado com sucesso!');
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
		setGeneralError('Voce nao tem permissao para criar poemas.');
		return;
	}

	if (status === 409 && message?.includes('slug')) {
		setError('title', {
			type: 'manual',
			message: 'Ja existe um poema com esse titulo.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Dados invalidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao criar poema. Tente novamente mais tarde.');
}

function useCreatePost() {
	return useMutation({
		mutationFn: (newPost: CreatePostType) =>
			createHTTPRequest<{ id: number }, CreatePostType>({
				path: '/poems',
				method: 'POST',
				body: newPost,
			}),
	});
}

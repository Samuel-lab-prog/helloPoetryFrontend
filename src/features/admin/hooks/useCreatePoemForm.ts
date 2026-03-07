import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPoemSchema, type CreatePoemType } from '../schemas/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHTTPRequest, type AppError } from '@features/base';

export function useCreatePoemForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<CreatePoemType>({
		resolver: zodResolver(createPoemSchema),
		mode: 'onChange',
		defaultValues: {
			status: 'draft',
			visibility: 'public',
			isCommentable: true,
			tags: [],
			toUserIds: [],
		},
	});

	const { mutateAsync, isPending } = useCreatePoem();

	async function onSubmit(data: CreatePoemType) {
		try {
			await mutateAsync(data);
			queryClient.invalidateQueries({ queryKey: ['poems-minimal'] });
			queryClient.invalidateQueries({ queryKey: ['poems'] });
			alert('Poema criado com sucesso!');
		} catch (err) {
			handleCreatePoemError(err, form.setError, setGeneralError);
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

function handleCreatePoemError(
	err: unknown,
	setError: UseFormSetError<CreatePoemType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppError;
	const status = error?.statusCode;
	const message = error?.errorMessages?.join(' ');

	if (status === 401) {
		setGeneralError('Você não tem permissao para criar poemas.');
		return;
	}

	if (status === 409 && message?.includes('slug')) {
		setError('title', {
			type: 'manual',
			message: 'Ja existe um poema com esse título.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao criar poema. Tente novamente mais tarde.');
}

function useCreatePoem() {
	return useMutation({
		mutationFn: (newPoem: CreatePoemType) =>
			createHTTPRequest<{ id: number }, CreatePoemType>({
				path: '/poems',
				method: 'POST',
				body: newPoem,
			}),
	});
}

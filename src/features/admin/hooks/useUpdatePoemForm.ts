import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type AppError, createHTTPRequest } from '@features/base';
import { updatePoemSchema, type UpdatePoemType } from '../schemas/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdatePoemForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<UpdatePoemType>({
		resolver: zodResolver(updatePoemSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useUpdatePoem();

	async function onSubmit(data: UpdatePoemType) {
		try {
			await mutateAsync(data);
			queryClient.invalidateQueries({ queryKey: ['poems-minimal'] });
			queryClient.invalidateQueries({ queryKey: ['poem', data.id] });
			alert('Poema atualizado com sucesso!');
		} catch (err) {
			handleUpdatePoemError(err, form.setError, setGeneralError);
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

function handleUpdatePoemError(
	err: unknown,
	setError: UseFormSetError<UpdatePoemType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppError;
	const status = error?.statusCode;
	const message = error?.errorMessages?.join(' ');

	if (status === 401) {
		setGeneralError('Você não tem permissao para atualizar poemas.');
		return;
	}

	if (status === 409 && message?.includes('slug')) {
		setError('title', {
			type: 'manual',
			message: 'Ja existe um poema com esse novo título.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao atualizar poema. Tente novamente mais tarde.');
}

function useUpdatePoem() {
	return useMutation({
		mutationFn: (updatedPoem: UpdatePoemType) =>
			createHTTPRequest<{ id: number }, Omit<UpdatePoemType, 'id'>>({
				path: '/poems',
				params: [Number(updatedPoem.id)],
				method: 'PUT',
				body: {
					title: updatedPoem.title,
					excerpt: updatedPoem.excerpt,
					content: updatedPoem.content,
					tags: updatedPoem.tags,
					status: updatedPoem.status,
					visibility: updatedPoem.visibility,
					isCommentable: updatedPoem.isCommentable,
				},
			}),
	});
}

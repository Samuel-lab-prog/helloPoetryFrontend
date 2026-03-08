import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePoemSchema, type DeletePoemType } from '../schemas/schemas';
import { type AppError, createHTTPRequest } from '@features/base';

export function useDeletePoemForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<DeletePoemType>({
		resolver: zodResolver(deletePoemSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useDeletePoem();

	async function onSubmit(data: DeletePoemType) {
		try {
			await mutateAsync(data.id);
			alert('Poema deletado com sucesso!');
			queryClient.invalidateQueries({ queryKey: ['poems-minimal'] });
			form.reset();
		} catch (err) {
			handleDeletePoemError(err, setGeneralError);
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

function useDeletePoem() {
	return useMutation({
		mutationFn: (poemId: number) =>
			createHTTPRequest<void>({
				path: '/poems',
				params: [poemId],
				method: 'DELETE',
			}),
	});
}

function handleDeletePoemError(err: unknown, setGeneralError: (msg: string) => void) {
	const error = err as AppError;
	const status = error?.statusCode;

	if (status === 401) {
		setGeneralError('Você não tem permissao para deletar poemas.');
		return;
	}

	if (status === 404) {
		setGeneralError('Poema não encontrado.');
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao deletar poema. Tente novamente mais tarde.');
}

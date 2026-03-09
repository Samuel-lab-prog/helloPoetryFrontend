import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePoemSchema, type DeletePoemType } from '../../schemas/managePoemSchemas';
import { createHTTPRequest } from '@features/base';
import { handleDeletePoemError } from './handleDeletePoemError';

export function useDeletePoemForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<DeletePoemType>({
		resolver: zodResolver(deletePoemSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useDeletePoem();

	async function onSubmit(data: DeletePoemType) {
		setGeneralError('');

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

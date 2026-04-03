import { zodResolver } from '@hookform/resolvers/zod';
import { api, apiKeys } from '@root/core/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { deletePoemSchema, type DeletePoemType } from '../../schemas/managePoemSchemas';
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
			alert('Poem deleted successfully!');
			queryClient.invalidateQueries({ queryKey: apiKeys.poems.minimal() });
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
		mutationFn: (poemId: number) => api.poems.deletePoem.mutate(String(poemId)),
	});
}

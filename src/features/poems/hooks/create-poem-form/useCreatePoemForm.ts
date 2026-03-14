import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPoemSchema, type CreatePoemType } from '../../schemas/managePoemSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleCreatePoemError } from './handleCreatePoemError';
import { api } from '@root/core/api';

export function useCreatePoemForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<CreatePoemType>({
		resolver: zodResolver(createPoemSchema),
		mode: 'onChange',
		defaultValues: {
			excerpt: '',
			status: 'draft',
			visibility: 'public',
			isCommentable: true,
			tags: [],
			toUserIds: [],
		},
	});

	const { mutateAsync, isPending } = useCreatePoem();

	async function onSubmit(data: CreatePoemType) {
		setGeneralError('');

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

function useCreatePoem() {
	return useMutation({
		mutationFn: (newPoem: CreatePoemType) => api.poems.createPoem.mutate(newPoem),
	});
}

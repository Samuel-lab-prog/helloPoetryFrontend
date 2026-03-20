import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePoemSchema, type UpdatePoemType } from '../../schemas/managePoemSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleUpdatePoemError } from './handleUpdatePoemError';
import { api } from '@root/core/api';

export function useUpdatePoemForm() {
	const queryClient = useQueryClient();
	const [generalError, setGeneralError] = useState('');

	const form = useForm<UpdatePoemType>({
		resolver: zodResolver(updatePoemSchema),
		mode: 'onChange',
	});

	const { mutateAsync, isPending } = useUpdatePoem();

	async function onSubmit(data: UpdatePoemType) {
		setGeneralError('');

		try {
			await mutateAsync(data);
			queryClient.invalidateQueries({ queryKey: ['poems-minimal'] });
			queryClient.invalidateQueries({ queryKey: ['poem', data.id] });
			alert('Poem updated successfully!');
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

function useUpdatePoem() {
	return useMutation({
		mutationFn: (updatedPoem: UpdatePoemType) =>
			api.poems.updatePoem.mutate({
				id: String(updatedPoem.id),
				title: updatedPoem.title,
				excerpt: updatedPoem.excerpt,
				content: updatedPoem.content,
				tags: updatedPoem.tags,
				status: updatedPoem.status,
				visibility: updatedPoem.visibility,
				isCommentable: updatedPoem.isCommentable,
			}),
	});
}

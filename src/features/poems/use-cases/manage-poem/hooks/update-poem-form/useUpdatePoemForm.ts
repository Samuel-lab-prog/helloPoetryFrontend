import { zodResolver } from '@hookform/resolvers/zod';
import { poems } from '@root/features/poems/api/endpoints';
import { poemKeys } from '@root/features/poems/api/keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { updatePoemSchema, type UpdatePoemType } from '../../schemas/managePoemSchemas';
import { handleUpdatePoemError } from './handleUpdatePoemError';

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
			queryClient.invalidateQueries({ queryKey: poemKeys.minimal() });
			queryClient.invalidateQueries({ queryKey: poemKeys.byId(String(data.id)) });
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
			poems.updatePoem.mutate({
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

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createHTTPRequest } from '@features/base';
import { updatePoemSchema, type UpdatePoemType } from '../../schemas/managePoemSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

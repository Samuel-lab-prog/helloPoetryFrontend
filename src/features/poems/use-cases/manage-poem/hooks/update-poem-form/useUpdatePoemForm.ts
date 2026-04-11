import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { findForbiddenWords } from '@Utils';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

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
			if (applyForbiddenWordsValidation(data, form.setError)) return;
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

function applyForbiddenWordsValidation(
	data: UpdatePoemType,
	setError: UseFormSetError<UpdatePoemType>,
) {
	let hasError = false;
	const fields: Array<{ key: 'title' | 'excerpt' | 'content'; value: string }> = [
		{ key: 'title', value: data.title },
		{ key: 'excerpt', value: data.excerpt },
		{ key: 'content', value: data.content },
	];

	for (const field of fields) {
		const forbiddenWordsFound = findForbiddenWords(field.value);
		if (forbiddenWordsFound.length === 0) continue;
		hasError = true;
		setError(field.key, {
			type: 'manual',
			message: `Remove forbidden words: ${forbiddenWordsFound.join(', ')}`,
		});
	}

	for (const tag of data.tags ?? []) {
		const forbiddenWordsFound = findForbiddenWords(tag);
		if (forbiddenWordsFound.length === 0) continue;
		hasError = true;
		setError('tags', {
			type: 'manual',
			message: `Tag contains forbidden words: ${forbiddenWordsFound.join(', ')}`,
		});
		break;
	}

	return hasError;
}

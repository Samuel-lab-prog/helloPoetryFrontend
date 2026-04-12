import { poems } from '@Api/poems/endpoints';
import { poemKeys } from '@Api/poems/keys';
import type { FullPoem } from '@Api/poems/types';
import { toaster } from '@BaseComponents';
import { zodResolver } from '@hookform/resolvers/zod';
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

	const { mutateAsync, isPending } = useDeletePoem(queryClient);

	async function onSubmit(data: DeletePoemType) {
		setGeneralError('');

		try {
			await mutateAsync(data.id);
			toaster.create({
				type: 'success',
				title: 'Poem deleted',
				description: 'Your poem was deleted successfully.',
				duration: 5000,
				meta: {
					colorPalette: 'green',
				},
				closable: true,
			});
			queryClient.invalidateQueries({ queryKey: poemKeys.minimal() });
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
		setValue: form.setValue,
		onSubmit,
		isPending,
		generalError,
	};
}

function useDeletePoem(queryClient: ReturnType<typeof useQueryClient>) {
	return useMutation({
		mutationFn: (poemId: number) => poems.deletePoem.mutate(String(poemId)),
		onMutate: async (poemId) => {
			const poemKey = poemKeys.byId(String(poemId));
			await queryClient.cancelQueries({ queryKey: poemKeys.mine() });
			await queryClient.cancelQueries({ queryKey: poemKey });

			const previousMyPoems = queryClient.getQueryData<FullPoem[]>(poemKeys.mine());
			const previousPoem = queryClient.getQueryData<FullPoem>(poemKey);

			if (previousMyPoems) {
				queryClient.setQueryData<FullPoem[]>(
					poemKeys.mine(),
					previousMyPoems.filter((poem) => poem.id !== poemId),
				);
			}

			queryClient.setQueryData(poemKey, undefined);

			return { previousMyPoems, previousPoem, poemId };
		},
		onError: (_error, _poemId, context) => {
			if (!context) return;
			if (context.previousMyPoems) {
				queryClient.setQueryData(poemKeys.mine(), context.previousMyPoems);
			}
			if (context.previousPoem) {
				queryClient.setQueryData(poemKeys.byId(String(context.poemId)), context.previousPoem);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: poemKeys.minimal() });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: poemKeys.mine() });
		},
	});
}

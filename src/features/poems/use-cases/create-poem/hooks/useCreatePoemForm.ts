import { useState } from 'react';
import { useForm, type UseFormSetError} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPoemSchema, type CreatePoemType } from '../../../schemas/managePoemSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@root/core/api';
import type { CreatePoemResult } from '@root/core/api/poems/types';
import type { AppErrorType } from '@root/core/base';

type UseCreatePoemFormOptions = {
	onCreated?: (poem: CreatePoemResult) => Promise<void> | void;
};

export function useCreatePoemForm(options: UseCreatePoemFormOptions = {}) {
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
			const createdPoem = await mutateAsync(data);
			if (options.onCreated) {
				await options.onCreated(createdPoem);
			}
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

export function handleCreatePoemError(
	err: unknown,
	setError: UseFormSetError<CreatePoemType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const lowerMessage = error?.message?.toLowerCase();

	if (status === 401) {
		setGeneralError('Você não tem permissão para criar poemas.');
		return;
	}

	if (status === 403) {
		if (lowerMessage.includes('assign or mention themselves')) {
			setError('toUserIds', {
				type: 'manual',
				message: 'Você não pode dedicar o poema para si mesmo.',
			});
			return;
		}

		if (lowerMessage.includes('author is not active')) {
			setGeneralError('Seu usuário precisa estar ativo para criar poemas.');
			return;
		}

		setGeneralError('Você não tem permissão para criar este poema.');
		return;
	}

	if (status === 409) {
		if (
			lowerMessage.includes('same title') ||
			lowerMessage.includes('slug') ||
			lowerMessage.includes('title')
		) {
			setError('title', {
				type: 'manual',
				message: 'Você já tem um poema com este título.',
			});
			return;
		}

		setGeneralError('Conflito ao criar poema. Revise os dados e tente novamente.');
		return;
	}

	if (status === 422) {
		if (mapCreatePoemValidationError(lowerMessage, setError)) return;
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao criar poema. Tente novamente mais tarde.');
}

function mapCreatePoemValidationError(
	lowerMessage: string,
	setError: UseFormSetError<CreatePoemType>,
) {
	if (!lowerMessage) return false;

	if (lowerMessage.includes('title')) {
		setError('title', { type: 'manual', message: 'Título inválido.' });
		return true;
	}

	if (lowerMessage.includes('excerpt') || lowerMessage.includes('summary')) {
		setError('excerpt', { type: 'manual', message: 'Resumo inválido.' });
		return true;
	}

	if (lowerMessage.includes('content')) {
		setError('content', { type: 'manual', message: 'Conteúdo inválido.' });
		return true;
	}

	if (lowerMessage.includes('tag')) {
		setError('tags', { type: 'manual', message: 'Tags inválidas.' });
		return true;
	}

	if (lowerMessage.includes('status')) {
		setError('status', { type: 'manual', message: 'Status inválido.' });
		return true;
	}

	if (lowerMessage.includes('visibility')) {
		setError('visibility', { type: 'manual', message: 'Visibilidade inválida.' });
		return true;
	}

	if (lowerMessage.includes('commentable') || lowerMessage.includes('comments')) {
		setError('isCommentable', {
			type: 'manual',
			message: 'Configuração de comentários inválida.',
		});
		return true;
	}

	if (
		lowerMessage.includes('dedicated users') ||
		lowerMessage.includes('mentioned users') ||
		lowerMessage.includes('touserids') ||
		lowerMessage.includes('invalid users')
	) {
		setError('toUserIds', {
			type: 'manual',
			message: 'Selecione apenas usuários ativos e válidos para dedicação.',
		});
		return true;
	}

	return false;
}

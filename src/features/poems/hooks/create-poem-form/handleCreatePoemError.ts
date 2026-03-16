import type { UseFormSetError } from 'react-hook-form';
import type { AppErrorType } from '@root/core/base';
import type { CreatePoemType } from '../../schemas/managePoemSchemas';

export function handleCreatePoemError(
	err: unknown,
	setError: UseFormSetError<CreatePoemType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = normalizeErrorMessage(error?.message);
	const lowerMessage = message.toLowerCase();

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

function normalizeErrorMessage(message: unknown) {
	if (typeof message === 'string') return message;
	if (Array.isArray(message)) {
		return message.filter((part): part is string => typeof part === 'string').join(' ');
	}
	return '';
}

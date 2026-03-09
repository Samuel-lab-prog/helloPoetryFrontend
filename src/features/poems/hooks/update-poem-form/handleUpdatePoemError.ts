import type { UseFormSetError } from 'react-hook-form';
import type { AppErrorType } from '@features/base';
import type { UpdatePoemType } from '../../schemas/managePoemSchemas';

export function handleUpdatePoemError(
	err: unknown,
	setError: UseFormSetError<UpdatePoemType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = normalizeErrorMessage(error?.message);

	if (status === 401) {
		setGeneralError('VocÃª nÃ£o tem permissao para atualizar poemas.');
		return;
	}

	if (status === 409 && (message.includes('slug') || message.includes('title'))) {
		setError('title', {
			type: 'manual',
			message: 'Ja existe um poema com esse novo tÃ­tulo.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Dados invÃ¡lidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao atualizar poema. Tente novamente mais tarde.');
}

function normalizeErrorMessage(message: unknown) {
	if (typeof message === 'string') return message;
	if (Array.isArray(message)) {
		return message.filter((part): part is string => typeof part === 'string').join(' ');
	}
	return '';
}

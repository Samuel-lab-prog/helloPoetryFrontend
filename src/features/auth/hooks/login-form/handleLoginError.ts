import type { AppErrorType } from '@features/base';
import type { UseFormSetError } from 'react-hook-form';
import type { LoginDataType } from '../../schemas/loginSchema';

export function handleLoginError(
	err: unknown,
	setError: UseFormSetError<LoginDataType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = normalizeErrorMessage(error?.message).toLowerCase();

	if (status === 401) {
		setError('email', {
			type: 'manual',
			message: 'Credenciais incorretas',
		});
		setError('password', {
			type: 'manual',
			message: 'Credenciais incorretas',
		});
		return;
	}

	if (status === 403) {
		if (message.includes('not active') || message.includes('inactive')) {
			setGeneralError('Sua conta não está ativa.');
			return;
		}

		setGeneralError('Você não tem permissão para acessar.');
		return;
	}

	if (status === 422) {
		setGeneralError('Dados de login inválidos. Revise os campos.');
		return;
	}

	if (status === 429) {
		setGeneralError('Muitas tentativas. Por favor, tente novamente mais tarde.');
		return;
	}

	setGeneralError('Erro de rede, por favor tente novamente.');
}

function normalizeErrorMessage(message: unknown) {
	if (typeof message === 'string') return message;
	if (Array.isArray(message)) {
		return message.filter((part): part is string => typeof part === 'string').join(' ');
	}
	return '';
}

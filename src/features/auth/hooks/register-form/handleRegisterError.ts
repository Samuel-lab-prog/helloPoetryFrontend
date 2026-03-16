import type { AppErrorType } from '@root/core/base';
import type { UseFormSetError } from 'react-hook-form';
import type { RegisterDataType } from '../../schemas/registerSchema';

export function handleRegisterError(
	err: unknown,
	setError: UseFormSetError<RegisterDataType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = normalizeErrorMessage(error?.message).toLowerCase();

	if (status === 409) {
		let mapped = false;

		if (message.includes('nickname')) {
			setError('nickname', {
				type: 'manual',
				message: 'Apelido já está em uso',
			});
			mapped = true;
		}

		if (message.includes('email')) {
			setError('email', {
				type: 'manual',
				message: 'E-mail já está em uso',
			});
			mapped = true;
		}

		if (mapped) return;

		setGeneralError('Conflito ao criar conta. Revise os dados e tente novamente.');
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	if (status === 429) {
		setGeneralError('Muitas tentativas. Tente novamente mais tarde.');
		return;
	}

	setGeneralError('Erro de rede. Tente novamente.');
}

function normalizeErrorMessage(message: unknown) {
	if (typeof message === 'string') return message;
	if (Array.isArray(message)) {
		return message.filter((part): part is string => typeof part === 'string').join(' ');
	}
	return '';
}

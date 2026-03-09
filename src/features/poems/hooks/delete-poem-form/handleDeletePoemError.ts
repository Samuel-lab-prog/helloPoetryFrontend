import type { AppErrorType } from '@features/base';

export function handleDeletePoemError(err: unknown, setGeneralError: (msg: string) => void) {
	const error = err as AppErrorType;
	const status = error?.statusCode;

	if (status === 401) {
		setGeneralError('Você não tem permissao para deletar poemas.');
		return;
	}

	if (status === 404) {
		setGeneralError('Poema não encontrado.');
		return;
	}

	if (status === 422) {
		setGeneralError('Dados inválidos. Verifique os campos e tente novamente.');
		return;
	}

	setGeneralError('Erro ao deletar poema. Tente novamente mais tarde.');
}

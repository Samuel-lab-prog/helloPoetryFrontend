import type { AppErrorType } from '@root/core/base';

export function handleDeletePoemError(err: unknown, setGeneralError: (msg: string) => void) {
	const error = err as AppErrorType;
	const status = error?.statusCode;

	if (status === 401) {
		setGeneralError('You do not have permission to delete poems.');
		return;
	}

	if (status === 404) {
		setGeneralError('Poem not found.');
		return;
	}

	if (status === 422) {
		setGeneralError('Invalid data. Check the fields and try again.');
		return;
	}

	setGeneralError('Error deleting poem. Please try again later.');
}

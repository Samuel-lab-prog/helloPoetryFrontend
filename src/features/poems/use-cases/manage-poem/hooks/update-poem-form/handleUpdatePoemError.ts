import type { AppErrorType } from '@BaseComponents';
import type { UseFormSetError } from 'react-hook-form';

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
		setGeneralError('You do not have permission to update poems.');
		return;
	}

	if (status === 409 && (message.includes('slug') || message.includes('title'))) {
		setError('title', {
			type: 'manual',
			message: 'A poem already exists with this new title.',
		});
		return;
	}

	if (status === 422) {
		setGeneralError('Invalid data. Check the fields and try again.');
		return;
	}

	setGeneralError('Error updating poem. Please try again later.');
}

function normalizeErrorMessage(message: unknown) {
	if (typeof message === 'string') return message;
	if (Array.isArray(message)) {
		return message.filter((part): part is string => typeof part === 'string').join(' ');
	}
	return '';
}

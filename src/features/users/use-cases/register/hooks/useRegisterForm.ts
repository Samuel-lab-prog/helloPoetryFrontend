import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { users } from '../../../api/endpoints';
import { uploadAvatarFile } from '../../../internal/utils/avatarUpload';
import type { CreateUserBody } from '../../../public/types';
import { type RegisterDataType, registerSchema } from '../schemas/registerSchema';

export function useRegisterForm() {
	const [generalError, setGeneralError] = useState('');
	const navigate = useNavigate();

	const form = useForm<RegisterDataType>({
		resolver: zodResolver(registerSchema),
		mode: 'onChange',
		defaultValues: {
			bio: '',
			avatar: null,
		},
	});

	const registerMutation = useMutation({
		mutationFn: (data: CreateUserBody) => users.createUser.mutate(data),

		onSuccess: () => {
			navigate('/login');
		},

		onError: (err: unknown) => {
			handleRegisterError(err, form.setError, setGeneralError);
		},
	});

	function onSubmit(data: RegisterDataType) {
		setGeneralError('');

		if (!form.formState.isValid) return;

		void (async () => {
			const { avatar, ...rest } = data;
			let avatarUrl: string | undefined;
			if (avatar) {
				try {
					avatarUrl = await uploadAvatarFile(avatar as File);
				} catch (err) {
					const message = err instanceof Error ? err.message : 'Error uploading avatar.';
					setGeneralError(message);
					return;
				}
			}
			const payload: CreateUserBody = {
				...rest,
				avatarUrl,
			};

			registerMutation.mutate(payload);
		})();
	}

	return {
		onSubmit,
		generalError,
		handleSubmit: form.handleSubmit,
		formState: form.formState,
		control: form.control,
		isPending: registerMutation.isPending,
		setError: form.setError,
		clearErrors: form.clearErrors,
	};
}

function handleRegisterError(
	err: unknown,
	setError: UseFormSetError<RegisterDataType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as AppErrorType;
	const status = error?.statusCode;
	const message = error?.message.toLowerCase();

	if (status === 409) {
		let mapped = false;

		if (message.includes('nickname')) {
			setError('nickname', {
				type: 'manual',
				message: 'Nickname is already in use',
			});
			mapped = true;
		}

		if (message.includes('email')) {
			setError('email', {
				type: 'manual',
				message: 'Email is already in use',
			});
			mapped = true;
		}

		if (mapped) return;

		setGeneralError('Conflict while creating the account. Review the data and try again.');
		return;
	}

	if (status === 422) {
		setGeneralError('Invalid data. Check the fields and try again.');
		return;
	}

	if (status === 429) {
		setGeneralError('Too many attempts. Please try again later.');
		return;
	}

	setGeneralError('Network error. Please try again.');
}

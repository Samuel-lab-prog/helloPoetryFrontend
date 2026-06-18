import { users } from '@Api/users/endpoints';
import type { CreateUserBody } from '@Api/users/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { AppErrorType } from '@Utils';
import { useState } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { uploadAvatarFile } from '../../../internal/utils/avatarUpload';
import {
	REGISTER_BIO_MAX_LENGTH,
	REGISTER_PASSWORD_MAX_LENGTH,
	REGISTER_PASSWORD_MIN_LENGTH,
} from '../schemas/constants';
import { type RegisterDataType, registerSchema } from '../schemas/registerSchema';

const REGISTER_NETWORK_ERROR_MESSAGE =
	"We couldn't create your account. Check your connection and try again.";
const AVATAR_UPLOAD_FALLBACK_MESSAGE = "We couldn't upload your avatar. Please try again.";

export function useRegisterForm() {
	const [generalError, setGeneralError] = useState('');
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
		form.clearErrors();

		if (isUploadingAvatar || registerMutation.isPending) return;

		void (async () => {
			const { avatar, ...rest } = data;
			let avatarUrl: string | undefined;
			try {
				if (avatar) {
					setIsUploadingAvatar(true);
					avatarUrl = await uploadAvatarFile(avatar as File);
				}

				const payload: CreateUserBody = {
					...rest,
					avatarUrl,
				};

				registerMutation.mutate(payload);
			} catch (err) {
				const message = err instanceof Error ? err.message : AVATAR_UPLOAD_FALLBACK_MESSAGE;
				form.setError('avatar', {
					type: 'manual',
					message,
				});
			} finally {
				setIsUploadingAvatar(false);
			}
		})();
	}

	return {
		onSubmit,
		generalError,
		handleSubmit: form.handleSubmit,
		formState: form.formState,
		control: form.control,
		isPending: isUploadingAvatar || registerMutation.isPending,
		setError: form.setError,
		clearErrors: form.clearErrors,
	};
}

function handleRegisterError(
	err: unknown,
	setError: UseFormSetError<RegisterDataType>,
	setGeneralError: (msg: string) => void,
) {
	const error = err as Partial<AppErrorType>;
	const status = error?.statusCode;
	const rawMessage = typeof error?.message === 'string' ? error.message : '';
	const message = rawMessage.toLowerCase();

	if (status === 409) {
		let mapped = false;

		if (message.includes('nickname')) {
			setError('nickname', {
				type: 'manual',
				message: 'This nickname is already in use.',
			});
			mapped = true;
		}

		if (message.includes('email')) {
			setError('email', {
				type: 'manual',
				message: 'This email is already in use.',
			});
			mapped = true;
		}

		if (mapped) return;

		setGeneralError('An account with these details may already exist. Review the fields and try again.');
		return;
	}

	if (status === 422) {
		if (setValidationFieldError(message, setError)) return;

		setGeneralError('Review your account details and try again.');
		return;
	}

	if (status === 429) {
		setGeneralError('Too many attempts. Please wait a moment and try again.');
		return;
	}

	setGeneralError(REGISTER_NETWORK_ERROR_MESSAGE);
}

function setValidationFieldError(
	message: string,
	setError: UseFormSetError<RegisterDataType>,
) {
	if (message.includes('email')) {
		setError('email', {
			type: 'manual',
			message: 'Enter a valid email address.',
		});
		return true;
	}

	if (message.includes('password')) {
		setError('password', {
			type: 'manual',
			message: `Password must be between ${REGISTER_PASSWORD_MIN_LENGTH} and ${REGISTER_PASSWORD_MAX_LENGTH} characters.`,
		});
		return true;
	}

	if (message.includes('bio')) {
		setError('bio', {
			type: 'manual',
			message: `Bio must be at most ${REGISTER_BIO_MAX_LENGTH} characters.`,
		});
		return true;
	}

	if (message.includes('avatar')) {
		setError('avatar', {
			type: 'manual',
			message: "We couldn't use this avatar. Choose another image and try again.",
		});
		return true;
	}

	return false;
}

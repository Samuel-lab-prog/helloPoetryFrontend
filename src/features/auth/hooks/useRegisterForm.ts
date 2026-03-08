import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { createHTTPRequest, type AppErrorType } from '@features/base';
import {
	registerSchema,
	type RegisterDataType,
} from '../schemas/registerSchema';

export function useRegisterForm() {
	const [generalError, setGeneralError] = useState('');
	const navigate = useNavigate();

	const form = useForm<RegisterDataType>({
		resolver: zodResolver(registerSchema),
		mode: 'onChange',
	});

	const registerMutation = useMutation({
		mutationFn: (data: RegisterDataType) =>
			createHTTPRequest<void, RegisterDataType>({
				path: '/users',
				method: 'POST',
				body: data,
			}),
		onSuccess: () => {
			navigate('/login');
		},
		onError: (err: unknown) => {
			const error = err as AppErrorType;

			if (error.statusCode === 409) {
				if (error.message?.includes('Nickname')) {
					form.setError('nickname', {
						type: 'manual',
						message: 'Apelido já está em uso',
					});
				}

				if (error.message?.includes('Email')) {
					form.setError('email', {
						type: 'manual',
						message: 'E-mail já está em uso',
					});
				}
				return;
			}

			setGeneralError('Erro de rede. Tente novamente.');
		},
	});

	function onSubmit(data: RegisterDataType) {
		setGeneralError('');
		registerMutation.mutate(data);
	}

	return {
		onSubmit,
		generalError,
		handleSubmit: form.handleSubmit,
		formState: form.formState,
		control: form.control,
		isPending: registerMutation.isPending,
	};
}

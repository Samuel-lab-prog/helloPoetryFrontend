import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { registerSchema, type RegisterDataType } from '../../schemas/registerSchema';
import { handleRegisterError } from './handleRegisterError';
import { api } from '@root/core/api';

export function useRegisterForm() {
	const [generalError, setGeneralError] = useState('');
	const navigate = useNavigate();

	const form = useForm<RegisterDataType>({
		resolver: zodResolver(registerSchema),
		mode: 'onChange',
		defaultValues: {
			bio: '',
		},
	});

	const registerMutation = useMutation({
		mutationFn: (data: RegisterDataType) => api.users.createUser.mutate(data),

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

		registerMutation.mutate(data);
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

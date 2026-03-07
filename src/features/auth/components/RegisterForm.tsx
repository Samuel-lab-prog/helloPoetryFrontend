import { DynamicForm, type Field } from '@features/base';
import { useRegisterForm } from '../hooks/useRegisterForm';
import type { RegisterDataType } from '../schemas/registerSchema';

const registerFields: Field<RegisterDataType>[] = [
	{ name: 'nickname', label: 'Apelido', required: true, autoFocus: true },
	{ name: 'name', label: 'Nome', required: true },
	{ name: 'email', label: 'E-mail', required: true },
	{ name: 'password', label: 'Senha', required: true, type: 'password' },
	{ name: 'bio', label: 'Bio', required: true, type: 'textarea' },
	{ name: 'avatarUrl', label: 'URL do avatar', required: false },
];

export function RegisterForm() {
	const {
		control,
		formState,
		onSubmit,
		isPending,
		generalError,
		handleSubmit,
	} = useRegisterForm();

	return (
		<DynamicForm<RegisterDataType>
			fields={registerFields}
			control={control}
			errors={formState.errors}
			isValid={formState.isValid}
			loading={isPending}
			generalError={generalError}
			onSubmit={onSubmit}
			handleSubmitFn={handleSubmit}
			buttonLabel='Criar conta'
			buttonVariant='surface'
		/>
	);
}

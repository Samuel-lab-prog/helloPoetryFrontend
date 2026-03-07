import { DynamicForm, type Field } from '@features/base';
import { useRegisterForm } from '../hooks/useRegisterForm';
import type { RegisterDataType } from '../schemas/registerSchema';

const registerFields: Field<RegisterDataType>[] = [
	{ name: 'nickname', label: 'Nickname', required: true, autoFocus: true },
	{ name: 'name', label: 'Name', required: true },
	{ name: 'email', label: 'Email', required: true },
	{ name: 'password', label: 'Password', required: true, type: 'password' },
	{ name: 'bio', label: 'Bio', required: true, type: 'textarea' },
	{ name: 'avatarUrl', label: 'Avatar URL', required: false },
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
			buttonLabel='Create account'
		/>
	);
}

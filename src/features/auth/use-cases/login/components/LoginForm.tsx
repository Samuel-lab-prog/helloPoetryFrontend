import { DynamicForm, type Field } from '@BaseComponents';
import { useLoginForm } from '../hooks/useLoginForm';
import type { LoginDataType } from '../schemas/loginSchema';

const loginFields: Field<LoginDataType>[] = [
	{ name: 'email', label: 'Email', required: true, autoFocus: true },
	{ name: 'password', label: 'Password', required: true, type: 'password' },
];

export function LoginForm() {
	const {
		control,
		formState,
		onSubmit,
		isPending,
		generalError,
		handleSubmit
	} = useLoginForm();

	return (
		<DynamicForm<LoginDataType>
			fields={loginFields}
			control={control}
			errors={formState.errors}
			isValid={formState.isValid}
			loading={isPending}
			generalError={generalError}
			onSubmit={onSubmit}
			handleSubmitFn={handleSubmit}
			buttonLabel='Sign in'
			buttonVariant='surface'
		/>
	);
}

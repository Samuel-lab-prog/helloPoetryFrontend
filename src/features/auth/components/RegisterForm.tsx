import { DynamicForm, type Field, createHTTPRequest } from '@features/base';
import { useRegisterForm } from '../hooks/useRegisterForm';
import type { RegisterDataType } from '../schemas/registerSchema';

async function checkNicknameAvailability(
	nickname: string,
): Promise<string | null> {
	if (!nickname || nickname.length < 3) return null;
	const res = await createHTTPRequest<boolean>({
		path: `/users/check-nickname`,
		query: { nickname: String(nickname) },
		method: 'GET',
	});
	return res ? 'Apelido já está em uso' : null;
}

async function checkEmailAvailability(email: string): Promise<string | null> {
	if (!email || email.length < 5) return null;

	const res = await createHTTPRequest<boolean>({
		path: `/users/check-email`,
		query: { email: String(email) },
		method: 'GET',
	});
	return res ? 'E-mail já está em uso' : null;
}

const registerFields: Field<RegisterDataType>[] = [
	{
		name: 'nickname',
		label: 'Apelido',
		required: true,
		autoFocus: true,
		asyncValidator: checkNicknameAvailability,
		debounce: 300,
	},

	{
		name: 'name',
		label: 'Nome',
		required: true,
	},

	{
		name: 'email',
		label: 'E-mail',
		required: true,
		asyncValidator: checkEmailAvailability,
		debounce: 300,
	},

	{
		name: 'password',
		label: 'Senha',
		required: true,
		type: 'password',
	},

	{
		name: 'bio',
		label: 'Bio',
		required: true,
		type: 'textarea',
	},

	{
		name: 'avatarUrl',
		label: 'URL do avatar',
		required: false,
	},
];

export function RegisterForm() {
	const {
		control,
		formState,
		onSubmit,
		isPending,
		generalError,
		handleSubmit,
		setError,
		clearErrors,
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
			setError={setError}
			clearErrors={clearErrors}
			buttonLabel='Criar conta'
			buttonVariant='surface'
		/>
	);
}

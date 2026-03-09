import { DynamicForm, type Field, createHTTPRequest } from '@features/base';
import { useRegisterForm } from '../hooks/useRegisterForm';
import {
	REGISTER_BIO_MAX_LENGTH,
	REGISTER_BIO_MIN_LENGTH,
	REGISTER_NAME_MAX_LENGTH,
	REGISTER_NAME_MIN_LENGTH,
	REGISTER_NICKNAME_MAX_LENGTH,
	REGISTER_NICKNAME_MIN_LENGTH,
	REGISTER_PASSWORD_MAX_LENGTH,
	REGISTER_PASSWORD_MIN_LENGTH,
	type RegisterDataType,
} from '../schemas/registerSchema';

async function checkNicknameAvailability(nickname: string): Promise<string | null> {
	if (!nickname || nickname.length < REGISTER_NICKNAME_MIN_LENGTH) return null;
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
		minLength: REGISTER_NICKNAME_MIN_LENGTH,
		maxLength: REGISTER_NICKNAME_MAX_LENGTH,
		showCharacterCount: true,
		asyncValidator: checkNicknameAvailability,
		debounce: 300,
	},

	{
		name: 'name',
		label: 'Nome',
		required: true,
		minLength: REGISTER_NAME_MIN_LENGTH,
		maxLength: REGISTER_NAME_MAX_LENGTH,
		showCharacterCount: true,
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
		minLength: REGISTER_PASSWORD_MIN_LENGTH,
		maxLength: REGISTER_PASSWORD_MAX_LENGTH,
		showCharacterCount: true,
	},

	{
		name: 'bio',
		label: 'Bio',
		required: false,
		type: 'textarea',
		minLength: REGISTER_BIO_MIN_LENGTH,
		maxLength: REGISTER_BIO_MAX_LENGTH,
		showCharacterCount: true,
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

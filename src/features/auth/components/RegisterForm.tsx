import { DynamicForm, type Field } from '@features/base';
import {
	useRegisterForm,
	checkEmailAvailability,
	checkNicknameAvailability,
} from '../hooks/register-form';

import {
	REGISTER_BIO_MAX_LENGTH,
	REGISTER_BIO_MIN_LENGTH,
	REGISTER_NAME_MAX_LENGTH,
	REGISTER_NAME_MIN_LENGTH,
	REGISTER_NICKNAME_MAX_LENGTH,
	REGISTER_NICKNAME_MIN_LENGTH,
	REGISTER_PASSWORD_MAX_LENGTH,
	REGISTER_PASSWORD_MIN_LENGTH,
} from '../schemas/constants';
import type { RegisterDataType } from '../schemas/registerSchema';

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

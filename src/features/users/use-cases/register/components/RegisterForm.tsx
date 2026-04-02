import { DynamicForm, type Field } from '@BaseComponents';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { checkEmailAvailability } from '../hooks/checkEmail';
import { checkNicknameAvailability } from '../hooks/checkNickname';
import { getAvatarFileError, MAX_AVATAR_SIZE_MB } from '../../../utils/avatarUpload';

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
		label: 'Nickname',
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
		label: 'Name',
		required: true,
		minLength: REGISTER_NAME_MIN_LENGTH,
		maxLength: REGISTER_NAME_MAX_LENGTH,
		showCharacterCount: true,
	},

	{
		name: 'email',
		label: 'Email',
		required: true,
		asyncValidator: checkEmailAvailability,
		debounce: 300,
	},

	{
		name: 'password',
		label: 'Password',
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
		kind: 'file',
		name: 'avatar',
		label: 'Avatar (optional)',
		accept: 'image/*',
		buttonLabel: 'Choose file',
		helpText: `Max size: ${MAX_AVATAR_SIZE_MB}MB`,
		preview: 'image',
		validateFile: (file) => (file ? getAvatarFileError(file) : null),
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
			buttonLabel='Create account'
			buttonVariant='surface'
		/>
	);
}

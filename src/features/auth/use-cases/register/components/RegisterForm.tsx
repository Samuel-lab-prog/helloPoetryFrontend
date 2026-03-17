import { Avatar, Button, Flex, Input, Text, VisuallyHidden } from '@chakra-ui/react';
import { DynamicForm, type Field } from '@root/core/base';
import {
	useRegisterForm,
} from '../hooks/useRegisterForm';
import { checkEmailAvailability } from '../hooks/checkEmail';
import { checkNicknameAvailability } from '../hooks/checkNickname';

import {
	REGISTER_BIO_MAX_LENGTH,
	REGISTER_BIO_MIN_LENGTH,
	REGISTER_NAME_MAX_LENGTH,
	REGISTER_NAME_MIN_LENGTH,
	REGISTER_NICKNAME_MAX_LENGTH,
	REGISTER_NICKNAME_MIN_LENGTH,
	REGISTER_PASSWORD_MAX_LENGTH,
	REGISTER_PASSWORD_MIN_LENGTH,
} from '../../../constants';
import type { RegisterDataType } from './registerSchema';

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
		avatarFile,
		avatarPreviewUrl,
		onPickAvatar,
		avatarError,
		maxAvatarSizeMb,
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
			extraContent={
				<Flex direction='column' gap={3} mt={2}>
					<Text textStyle='small' color='pink.200'>
						Avatar (opcional)
					</Text>

					<Flex align='center' gap={3} wrap='wrap'>
						<Avatar.Root size='md'>
							<Avatar.Image src={avatarPreviewUrl ?? undefined} />
							<Avatar.Fallback name='Avatar' />
						</Avatar.Root>
						<Button as='label' size='sm' variant='outlinePurple' cursor='pointer'>
							Escolher arquivo
							<VisuallyHidden>
								<Input
									type='file'
									accept='image/*'
									onChange={(event) => {
										onPickAvatar(event.target.files?.[0] ?? null);
									}}
								/>
							</VisuallyHidden>
						</Button>
						<Text textStyle='smaller' color='pink.200'>
							{avatarFile ? avatarFile.name : 'Nenhum arquivo selecionado'}
						</Text>
					</Flex>

					<Text textStyle='smaller' color='pink.200'>
						Tamanho m�ximo: {maxAvatarSizeMb}MB
					</Text>

					{avatarError && (
						<Text textStyle='smaller' color='red.400'>
							{avatarError}
						</Text>
					)}
				</Flex>
			}
		/>
	);
}

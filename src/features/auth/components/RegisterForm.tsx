import { Button, Flex, Text } from '@chakra-ui/react';
import { FormField } from '@features/base';
import { useRegisterForm } from '../hooks/useRegisterForm';

export function RegisterForm() {
	const {
		handleSubmit,
		formState: { errors, isValid },
		onSubmit,
		isPending: loading,
		control,
		generalError,
	} = useRegisterForm();

	return (
		<Flex
			as='form'
			onSubmit={handleSubmit(onSubmit)}
			direction='column'
			align='center'
			gap={2}
			w='full'
			maxW='md'
		>
			{generalError && (
				<Text color='red.500' fontSize='sm' mb={2}>
					{generalError}
				</Text>
			)}

			<FormField
				name='nickname'
				label='Nickname'
				required
				control={control}
				error={errors.nickname}
			/>

			<FormField
				name='name'
				label='Name'
				required
				control={control}
				error={errors.name}
			/>

			<FormField
				name='email'
				label='Email'
				required
				control={control}
				error={errors.email}
			/>

			<FormField
				name='password'
				label='Password'
				required
				control={control}
				error={errors.password}
				type='password'
			/>

			<FormField
				name='bio'
				label='Bio'
				required
				control={control}
				error={errors.bio}
				as='textarea'
				rows={4}
			/>

			<Button
				type='submit'
				variant='surface'
				disabled={!isValid}
				loading={loading}
				mt={6}
				w='full'
			>
				Create account
			</Button>
		</Flex>
	);
}

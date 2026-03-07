import { Flex, Button, Text } from '@chakra-ui/react';
import { FormField } from '@features/base';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginForm() {
	const {
		handleSubmit,
		formState: { errors, isValid },
		onSubmit,
		isPending: loading,
		control,
		generalError,
	} = useLoginForm();

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
				<Text
					color='red.500'
					fontSize='sm'
					mb={2}
				>
					{generalError}
				</Text>
			)}

			<FormField
				name='email'
				label='E-mail'
				required
				control={control}
				error={errors.email}
			/>

			<FormField
				name='password'
				label='Senha'
				required
				control={control}
				error={errors.password}
				type='password'
			/>

			<Button
				type='submit'
				variant='surface'
				disabled={!isValid}
				loading={loading}
				mt={6}
				w='full'
			>
				Entrar
			</Button>
		</Flex>
	);
}

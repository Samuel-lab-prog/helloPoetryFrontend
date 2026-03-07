import { Box, Button, Flex, Text } from '@chakra-ui/react';
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
			p={6}
			w='full'
			maxW='md'
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			backdropFilter='blur(4px)'
			transition='background-color 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease'
			_hover={{ borderColor: 'purple.500', bg: 'rgba(255, 255, 255, 0.04)' }}
			_focusWithin={{
				borderColor: 'pink.400',
				bg: 'rgba(255, 255, 255, 0.06)',
				boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
			}}
			animationName='fade-in'
			animationDuration='420ms'
			animationTimingFunction='ease-out'
		>
			{generalError && (
				<Text
					color='red.500'
					fontSize='sm'
					mb={2}
					animationName='shake-x, fade-in'
					animationDuration='360ms'
				>
					{generalError}
				</Text>
			)}

			<Box
				w='full'
				p='1'
				border='1px solid'
				borderColor='transparent'
				borderRadius='md'
				transition='border-color 0.22s ease, background-color 0.22s ease'
				_focusWithin={{
					borderColor: 'purple.500',
					bg: 'rgba(255, 214, 231, 0.06)',
				}}
				animationName='slide-from-bottom, fade-in'
				animationDuration='380ms'
				animationTimingFunction='ease-out'
				animationFillMode='backwards'
				animationDelay='40ms'
			>
				<FormField
					name='email'
					label='E-mail'
					required
					control={control}
					error={errors.email}
				/>
			</Box>

			<Box
				w='full'
				p='1'
				border='1px solid'
				borderColor='transparent'
				borderRadius='md'
				transition='border-color 0.22s ease, background-color 0.22s ease'
				_focusWithin={{
					borderColor: 'purple.500',
					bg: 'rgba(255, 214, 231, 0.06)',
				}}
				animationName='slide-from-bottom, fade-in'
				animationDuration='380ms'
				animationTimingFunction='ease-out'
				animationFillMode='backwards'
				animationDelay='120ms'
			>
				<FormField
					name='password'
					label='Senha'
					required
					control={control}
					error={errors.password}
					type='password'
				/>
			</Box>

			<Button
				type='submit'
				variant='surface'
				disabled={!isValid}
				loading={loading}
				mt={6}
				w='full'
				transition='transform 0.16s ease, box-shadow 0.16s ease'
				_hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
				_active={{ transform: 'translateY(0)' }}
				animationName='slide-from-bottom, fade-in'
				animationDuration='380ms'
				animationTimingFunction='ease-out'
				animationFillMode='backwards'
				animationDelay='180ms'
			>
				Entrar
			</Button>
		</Flex>
	);
}

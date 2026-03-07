import { Box, Button, Flex, Text } from '@chakra-ui/react';
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
			gap={4}
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
					name='nickname'
					label='Nickname'
					required
					control={control}
					error={errors.nickname}
          autoFocus
          
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
				animationDelay='90ms'
			>
				<FormField
					name='name'
					label='Name'
					required
					control={control}
					error={errors.name}
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
				animationDelay='140ms'
			>
				<FormField
					name='email'
					label='Email'
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
				animationDelay='190ms'
			>
				<FormField
					name='password'
					label='Password'
					required
					control={control}
					error={errors.password}
					type='password'
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
				animationDelay='240ms'
			>
				<FormField
					name='bio'
					label='Bio'
					control={control}
					error={errors.bio}
					as='textarea'
					rows={4}
				/>
			</Box>

			<Button
				type='submit'
				variant='surface'
				disabled={!isValid}
				loading={loading}
				mt={6}
				w='full'
				opacity={isValid ? 1 : 0.72}
				filter={isValid ? 'saturate(1)' : 'saturate(0.72)'}
				transition='opacity 0.24s ease, filter 0.24s ease, transform 0.16s ease, box-shadow 0.16s ease, background-color 0.24s ease, border-color 0.24s ease'
				_hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
				_active={{ transform: 'translateY(0)' }}
				_disabled={{
					opacity: 0.72,
					filter: 'saturate(0.72)',
					cursor: 'not-allowed',
				}}
				animationName='slide-from-bottom, fade-in'
				animationDuration='380ms'
				animationTimingFunction='ease-out'
				animationFillMode='backwards'
				animationDelay='300ms'
			>
				Create account
			</Button>
		</Flex>
	);
}

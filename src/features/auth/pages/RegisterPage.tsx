import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
	return (
		<Flex as='main' layerStyle='main' direction='column'>
			<Flex as='section' direction='column' align='center' justify='end' mt='120px'>
				<Flex direction='column' align='center' mb={4} gap={2} textAlign='center'>
					<Heading as='h1' textStyle='h1' color='accent'>
						Criar conta
					</Heading>

					<Text variant='muted' >
						Preencha seus dados para criar sua conta.
					</Text>
				</Flex>

				<RegisterForm />

				<Text mt={4} variant='muted' textAlign='center'>
					Já tem uma conta?{' '}
					<Link asChild color='pink.300' textDecoration='underline'>
						<NavLink to='/login'>Entrar</NavLink>
					</Link>
				</Text>
			</Flex>
		</Flex>
	);
}

import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';

function PageHeader() {
	return (
		<Flex direction='column' align='center' mb={4} gap={2} textAlign='center'>
			<Heading as='h1' textStyle='h1' color='accent'>
				Entrar
			</Heading>
			<Text variant='muted'>Informe suas credenciais para entrar.</Text>
		</Flex>
	);
}

export function LoginPage() {
	return (
		<Flex as='main' layerStyle='main' direction='column'>
			<Flex as='section' direction='column' align='center' justify='center' mt='120px'>
				<PageHeader />
				<LoginForm />

				<Text mt={4} variant='muted' textAlign='center'>
					Ainda não tem uma conta?{' '}
					<Link asChild color='pink.300' textDecoration='underline'>
						<NavLink to='/register'>Criar conta</NavLink>
					</Link>
				</Text>
			</Flex>
		</Flex>
	);
}

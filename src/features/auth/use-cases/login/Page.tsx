import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';

function PageHeader() {
	return (
		<Flex direction='column' align='center' mb={4} gap={2} textAlign='center'>
			<Heading as='h1' textStyle='h1' color='accent'>
				Sign in
			</Heading>
			<Text variant='muted'>Enter your credentials to sign in.</Text>
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
					Don't have an account yet?{' '}
					<Link asChild color='pink.300' textDecoration='underline'>
						<NavLink to='/register'>Create account</NavLink>
					</Link>
				</Text>
			</Flex>
		</Flex>
	);
}

import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
		>
			<Flex
				as='section'
				direction='column'
				align='center'
				justify='center'
				h={['70vh', undefined, '60vh']}
			>
				<Flex
					direction='column'
					align='center'
					mb={4}
					gap={2}
					textAlign='center'
				>
					<Heading
						as='h1'
						textStyle='h2'
						color='accent'
					>
						Entrar
					</Heading>

					<Text
						textStyle='small'
						color='pink.100'
					>
						Informe suas credenciais para entrar.
					</Text>
				</Flex>

				<LoginForm />

				<Text
					mt={4}
					textStyle='small'
					color='pink.100'
					textAlign='center'
				>
					Ainda não tem uma conta?{' '}
					<Link
						asChild
						color='pink.200'
						textDecoration='underline'
					>
						<NavLink to='/register'>Criar conta</NavLink>
					</Link>
				</Text>
			</Flex>
		</Flex>
	);
}

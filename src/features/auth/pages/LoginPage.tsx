import { Flex, Heading, Text } from '@chakra-ui/react';
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
				px={4}
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
						textStyle='h1'
					>
						Entrar
					</Heading>

					<Text
						color='gray.600'
						textStyle='small'
					>
						Por favor, insira suas credenciais para entrar.
					</Text>
				</Flex>

				<LoginForm />
			</Flex>
		</Flex>
	);
}

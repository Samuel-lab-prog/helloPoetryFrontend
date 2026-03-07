import { Flex, Heading, Text } from '@chakra-ui/react';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
	return (
		<Flex as='main' layerStyle='main' direction='column'>
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
					<Heading as='h1' textStyle='h1' color='accent'>
						Login
					</Heading>

					<Text textStyle='small'>
						Please enter your credentials to log in.
					</Text>
				</Flex>

				<LoginForm />
			</Flex>
		</Flex>
	);
}

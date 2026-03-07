import { Flex, Heading, Text } from '@chakra-ui/react';
import { RegisterForm } from '../components/RegisterForm';

export function RegisterPage() {
	return (
		<Flex as='main' layerStyle='main' direction='column'>
			<Flex as='section' direction='column' align='center'>
				<Flex
					direction='column'
					align='center'
					mb={4}
					gap={2}
					textAlign='center'
				>
					<Heading as='h1' textStyle='h1' color='accent'>
						Create account
					</Heading>

					<Text textStyle='small' color='pink.100'>
						Fill in your details to create your account.
					</Text>
				</Flex>

				<RegisterForm />
			</Flex>
		</Flex>
	);
}

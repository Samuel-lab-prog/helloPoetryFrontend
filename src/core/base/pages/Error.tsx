import { Flex, Heading, Text, Box, Button } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export function ErrorPage() {
	return (
		<Flex minH='100vh' align='center' justify='center' px={6} py={20} textAlign='center'>
			<Box maxW='md'>
				<Heading as='h1' textStyle='h2'>
					Ops!
				</Heading>

				<Heading as='h2' textStyle='h5' mt={3}>
					Algo deu errado ou esta página não existe.
				</Heading>

				<Text textStyle='small' mt={1}>
					Tente voltar para a página inicial ou conferir a URL.
				</Text>

				<Box mt={6}>
					<Button asChild variant='solidPink'>
						<NavLink to='/'>Voltar para o início</NavLink>
					</Button>
				</Box>
			</Box>
		</Flex>
	);
}

import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export function ErrorPage() {
	return (
		<Flex minH='100vh' align='center' justify='center' px={6} py={20} textAlign='center'>
			<Box maxW='md'>
				<Heading as='h1' textStyle='h2'>
					Ops!
				</Heading>

				<Heading as='h2' textStyle='h5' mt={3}>
					Something went wrong or this page does not exist.
				</Heading>

				<Text textStyle='small' mt={1}>
					Try going back to the home page or checking the URL.
				</Text>

				<Box mt={6}>
					<Button asChild variant='solidPink'>
						<NavLink to='/'>Go back to the home page</NavLink>
					</Button>
				</Box>
			</Box>
		</Flex>
	);
}

import { Flex, Heading, Text, Box, Button } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

export function ErrorPage() {
	return (
		<Flex
			minH='100vh'
			align='center'
			justify='center'
			px={6}
			py={20}
			textAlign='center'
		>
			<Box maxW='md'>
				<Heading
					as='h1'
					textStyle='h1'
				>
					Oops!
				</Heading>

				<Heading
					as='h2'
					textStyle='h5'
					mt={3}
				>
					Something went wrong — or this page doesn’t exist.
				</Heading>

				<Text
					textStyle='small'
					mt={1}
				>
					Try returning to the homepage or checking the URL.
				</Text>

				<Box mt={6}>
					<Button
						asChild
						variant='surface'
					>
						<NavLink to='/'>Go back home</NavLink>
					</Button>
				</Box>
			</Box>
		</Flex>
	);
}

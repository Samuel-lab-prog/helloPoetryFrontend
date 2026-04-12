import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

import { RegisterForm } from './components/RegisterForm';

export function RegisterPage() {
	return (
		<Flex as='main' layerStyle='main' direction='column' align='center' py={12} px={[4, 4, 0]}>
			<Flex
				as='section'
				direction='column'
				align='center'
				justify='flex-start'
				gap={6}
				mt='0'
				w='full'
				maxW='md'
			>
				<PageHeader />
				<RegisterForm />
				<PageFooter />
			</Flex>
		</Flex>
	);
}

function PageHeader() {
	return (
		<Flex direction='column' align='center' mb={4} gap={2} textAlign='center'>
			<Heading as='h1' textStyle='h1' color='accent'>
				Create account
			</Heading>
			<Text variant='muted'>Fill in your details to create your account.</Text>
		</Flex>
	);
}

function PageFooter() {
	return (
		<Text mt={4} variant='muted' textAlign='center'>
			Already have an account?{' '}
			<Link asChild color='pink.300' textDecoration='underline'>
				<NavLink to='/login'>Sign in</NavLink>
			</Link>
		</Text>
	);
}

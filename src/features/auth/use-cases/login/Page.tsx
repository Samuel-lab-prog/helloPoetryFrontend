import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

import { LoginForm } from './components/LoginForm';

function PageHeader() {
	return (
		<Flex direction='column' align='center' mb={3} gap={1.5} textAlign='center'>
			<Heading as='h1' textStyle='h3' color='accent'>
				Sign in
			</Heading>
			<Text textStyle='small' color='pink.100'>
				Enter your credentials to sign in.
			</Text>
		</Flex>
	);
}

function PageFooter() {
	return (
		<Text mt={4} textStyle='small' color='pink.100' textAlign='center'>
			Don't have an account yet?{' '}
			<Link asChild color='pink.300' textDecoration='underline'>
				<NavLink to='/register'>Create account</NavLink>
			</Link>
		</Text>
	);
}

export function LoginPage() {
	return (
		<Flex
			as='main'
			layerStyle='mainPadded'
			flex='1'
			minH={0}
			direction='column'
			align='center'
			overflowY='auto'
			scrollbarGutter='stable'
		>
			<Flex
				as='section'
				direction='column'
				align='center'
				justify='flex-start'
				gap={5}
				mt='0'
				w='full'
				maxW='md'
			>
				<PageHeader />
				<LoginForm />
				<PageFooter />
			</Flex>
		</Flex>
	);
}

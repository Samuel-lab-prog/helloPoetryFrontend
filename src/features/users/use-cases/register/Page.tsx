import { Flex, Heading, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

import { RegisterForm } from './components/RegisterForm';

export function RegisterPage() {
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
		<Flex direction='column' align='center' mb={3} gap={1.5} textAlign='center'>
			<Heading as='h1' textStyle='h3' color='accent'>
				Create account
			</Heading>
			<Text textStyle='small' color='pink.100'>
				Fill in your details to create your account.
			</Text>
		</Flex>
	);
}

function PageFooter() {
	return (
		<Text mt={4} mb={4} textStyle='small' color='pink.100' textAlign='center'>
			Already have an account?{' '}
			<Link asChild color='pink.300' textDecoration='underline'>
				<NavLink to='/login'>Sign in</NavLink>
			</Link>
		</Text>
	);
}

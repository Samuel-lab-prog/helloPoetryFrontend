import { Surface } from '@BaseComponents';
import { Badge, Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import {
	getBannedPrivilegeMessage,
	getSuspendedPrivilegeMessage,
	useAuthClientStore,
} from '@features/auth/public';
import { NavLink } from 'react-router-dom';

import { CreatePoemForm } from './components/CreatePoemForm';

function CreatePoemAccessGate() {
	return (
		<Surface
			w='full'
			maxW='2xl'
			p={{ base: 5, md: 6 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
		>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Poems
				</Badge>
				<Text textStyle='h3'>Sign in to create a poem</Text>
				<Text textStyle='small' color='pink.100'>
					You need to be authenticated to publish new poems.
				</Text>
				<HStack gap={3} wrap='wrap'>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
						<NavLink to='/login'>Sign in</NavLink>
					</Button>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/register'>Create account</NavLink>
					</Button>
				</HStack>
			</VStack>
		</Surface>
	);
}

function SuspendedCreatePoemGate() {
	return (
		<Surface
			w='full'
			maxW='2xl'
			p={{ base: 5, md: 6 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
		>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Poems
				</Badge>
				<Text textStyle='h3'>Create poem unavailable</Text>
				<Text textStyle='small' color='pink.100'>
					{getSuspendedPrivilegeMessage('create poems')}
				</Text>
				<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
					<NavLink to='/'>Go to home</NavLink>
				</Button>
			</VStack>
		</Surface>
	);
}

function BannedCreatePoemGate() {
	return (
		<Surface
			w='full'
			maxW='2xl'
			p={{ base: 5, md: 6 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
		>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Poems
				</Badge>
				<Text textStyle='h3'>Create poem unavailable</Text>
				<Text textStyle='small' color='pink.100'>
					{getBannedPrivilegeMessage('create poems')}
				</Text>
				<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
					<NavLink to='/my-profile'>Go to profile</NavLink>
				</Button>
			</VStack>
		</Surface>
	);
}

export function CreatePoemPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const isAuthenticated = !!authClient?.id;

	if (!isAuthenticated) {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<CreatePoemAccessGate />
			</Flex>
		);
	}

	if (authClient.status === 'suspended') {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<SuspendedCreatePoemGate />
			</Flex>
		);
	}

	if (authClient.status === 'banned') {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center'>
				<BannedCreatePoemGate />
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center' gap={4}>
			<Flex as='section' direction='column' w='full' maxW='3xl'>
				<Heading as='h1' textStyle='h2' color='accent' mb={0} textAlign='center'>
					Create Poem
				</Heading>
			</Flex>

			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Flex direction='column' w='full' maxW='3xl'>
					<CreatePoemForm />
				</Flex>
			</Flex>
		</Flex>
	);
}

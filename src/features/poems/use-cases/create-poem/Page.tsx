import { ErrorStateCard } from '@BaseComponents';
import { Button, Flex, Heading, HStack, Icon, Text } from '@chakra-ui/react';
import {
	AuthRequiredCard,
	getBannedPrivilegeMessage,
	getSuspendedPrivilegeMessage,
	useAuthClientStore,
} from '@features/auth/public';
import { House, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { CreatePoemForm } from './components/CreatePoemForm';

function CreatePoemAccessGate() {
	return (
		<AuthRequiredCard
			maxW='2xl'
			eyebrow='POEMS UNAVAILABLE'
			title='Sign in to create a poem'
			description='This page is available only after sign in. Sign in to draft, publish, and manage your poems.'
		/>
	);
}

function SuspendedCreatePoemGate() {
	return (
		<ErrorStateCard
			maxW='2xl'
			eyebrow='POEMS UNAVAILABLE'
			title='Create poem unavailable'
			description={getSuspendedPrivilegeMessage('create poems')}
			action={
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/'>
						<HStack gap={2}>
							<Icon as={House} boxSize={3.5} />
							<Text as='span'>Go to home</Text>
						</HStack>
					</NavLink>
				</Button>
			}
		/>
	);
}

function BannedCreatePoemGate() {
	return (
		<ErrorStateCard
			maxW='2xl'
			eyebrow='POEMS UNAVAILABLE'
			title='Create poem unavailable'
			description={getBannedPrivilegeMessage('create poems')}
			action={
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/my-profile'>
						<HStack gap={2}>
							<Icon as={User} boxSize={3.5} />
							<Text as='span'>Go to profile</Text>
						</HStack>
					</NavLink>
				</Button>
			}
		/>
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

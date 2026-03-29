import { Badge, Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { CreatePoemForm } from './components/CreatePoemForm';

function PageHeader() {
	return (
		<Heading as='h1' textStyle='h1' color='accent' textAlign='center' mb={4}>
			Create Poem
		</Heading>
	);
}

function CreatePoemAccessGate() {
	return (
		<Surface
			w='full'
			maxW='2xl'
			p={{ base: 6, md: 8 }}
			variant='gradient'
			bg='linear-gradient(145deg, rgba(122,19,66,0.22) 0%, rgba(42,15,39,0.35) 100%)'
		>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Poems
				</Badge>
				<Text textStyle='h2'>Sign in to create a poem</Text>
				<Text textStyle='body' color='pink.100'>
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

export function CreatePoemPage() {
	const isAuthenticated = useAuthClientStore((state) => !!state.authClient?.id);

	if (!isAuthenticated) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<CreatePoemAccessGate />
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' gap={8}>
			<PageHeader />

			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Flex direction='column' w='full' maxW='xl'>
					<CreatePoemForm />
				</Flex>
			</Flex>
		</Flex>
	);
}

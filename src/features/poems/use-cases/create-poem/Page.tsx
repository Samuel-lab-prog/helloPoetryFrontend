import { Badge, Button, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Surface } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { CreatePoemForm } from './components/CreatePoemForm';

function PageHeader() {
	return (
		<Flex direction='column' align='center' mb={4} gap={2} textAlign='center'>
			<Heading as='h1' textStyle='h1' color='accent'>
				Create Poem
			</Heading>
			<Text color='pink.100'>Fill in the fields to publish a new poem.</Text>
		</Flex>
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
					Poemas
				</Badge>
				<Text textStyle='h2'>Entre para criar um poema</Text>
				<Text textStyle='body' color='pink.100'>
					Você precisa estar autenticado para publicar novos poemas.
				</Text>
				<HStack gap={3} wrap='wrap'>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' asChild>
						<NavLink to='/login'>Entrar</NavLink>
					</Button>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/register'>Criar conta</NavLink>
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
			<Flex as='section' direction='column' align='center' w='full'>
				<PageHeader />
			</Flex>

			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Flex direction='column' w='full' maxW='xl'>
					<CreatePoemForm />
				</Flex>
			</Flex>
		</Flex>
	);
}

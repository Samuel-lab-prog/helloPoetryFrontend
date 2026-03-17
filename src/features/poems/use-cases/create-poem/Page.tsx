import { Flex, Heading, Text } from '@chakra-ui/react';
import { CreatePoemForm } from './components/CreatePoemForm';

function PageHeader() {
	return (
		<Flex direction='column' align='center' mb={4} gap={2} textAlign='center'>
			<Heading as='h1' textStyle='h1' color='accent'>
				Criar Poema
			</Heading>
			<Text color='pink.100'>Preencha os campos para publicar um novo poema.</Text>
		</Flex>
	);
}

export function CreatePoemPage() {
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

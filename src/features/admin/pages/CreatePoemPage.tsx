import { Flex, Heading } from '@chakra-ui/react';
import { CreatePoemForm } from '../components/CreatePoemForm';

export function CreatePoemPage() {
	return (
		<Flex as='main' layerStyle='main' direction='column' gap={8}>
			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Heading as='h1' textStyle='h2' mb={6}>
					Criar Poema
				</Heading>
			</Flex>

			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Flex direction='column' w='full' maxW='4xl'>
					<CreatePoemForm />
				</Flex>
			</Flex>
		</Flex>
	);
}

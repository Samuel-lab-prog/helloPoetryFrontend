import { useState } from 'react';
import { Flex, Heading, Button } from '@chakra-ui/react';
import { CreatePoemForm } from '../components/CreatePoemForm';
import { UpdatePoemForm } from '../components/UpdatePoemForm';
import { DeletePoemForm } from '../components/DeletePoemForm';

type ActiveForm = 'create' | 'update' | 'delete';

export function AdminPage() {
	const [activeForm, setActiveForm] = useState<ActiveForm>('create');

	return (
		<Flex as='main' layerStyle='main' direction='column' gap={8}>
			<Flex
				as='section'
				direction='column'
				align='center'
				justify='center'
				w='full'
			>
				<Heading as='h1' textStyle='h1' mb={6}>
					Painel Administrativo
				</Heading>
				<Flex gap={2} mb={8} direction={['column', undefined, 'row']}>
					<Button variant='solidPink' onClick={() => setActiveForm('create')}>
						Criar Poema
					</Button>
					<Button variant='solidPink' onClick={() => setActiveForm('update')}>
						Atualizar Poema
					</Button>
					<Button variant='solidPink' onClick={() => setActiveForm('delete')}>
						Deletar Poema
					</Button>
				</Flex>
			</Flex>
			<Flex
				as='section'
				direction='column'
				align='center'
				justify='center'
				w='full'
			>
				<Flex direction='column' w='full' maxW='4xl'>
					{activeForm === 'create' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Criar Poema
							</Heading>
							<CreatePoemForm />
						</>
					)}

					{activeForm === 'update' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Atualizar Poema
							</Heading>
							<UpdatePoemForm />
						</>
					)}

					{activeForm === 'delete' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Deletar Poema
							</Heading>
							<DeletePoemForm />
						</>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}

import { useState } from 'react';
import { Flex, Heading, Button } from '@chakra-ui/react';
import { CreatePostForm } from '../components/CreatePostForm';
import { UpdatePostForm } from '../components/UpdatePostForm';
import { DeletePostForm } from '../components/DeletePostForm';

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
					Admin Dashboard
				</Heading>
				<Flex gap={2} mb={8} direction={['column', undefined, 'row']}>
					<Button variant='surface' onClick={() => setActiveForm('create')}>
						Criar Poema
					</Button>
					<Button variant='surface' onClick={() => setActiveForm('update')}>
						Atualizar Poema
					</Button>
					<Button variant='surface' onClick={() => setActiveForm('delete')}>
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
							<CreatePostForm />
						</>
					)}

					{activeForm === 'update' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Atualizar Poema
							</Heading>
							<UpdatePostForm />
						</>
					)}

					{activeForm === 'delete' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Deletar Poema
							</Heading>
							<DeletePostForm />
						</>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}

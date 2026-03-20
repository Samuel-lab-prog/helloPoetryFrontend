import { useEffect, useState } from 'react';
import { Flex, Heading, Button } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { CreatePoemForm } from '../use-cases/create-poem/components/CreatePoemForm';
import { UpdatePoemForm } from '../components/manage/UpdatePoemForm';
import { DeletePoemForm } from '../components/manage/DeletePoemForm';

type ActiveForm = 'create' | 'update' | 'delete';

export function AdminPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [activeForm, setActiveForm] = useState<ActiveForm>('create');
	const modeParam = searchParams.get('mode');

	useEffect(() => {
		if (modeParam === 'create' || modeParam === 'update' || modeParam === 'delete') {
			setActiveForm(modeParam);
		}
	}, [modeParam]);

	function changeForm(mode: ActiveForm) {
		const params = new URLSearchParams(searchParams);
		params.set('mode', mode);
		setSearchParams(params, { replace: true });
		setActiveForm(mode);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' gap={8}>
			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Heading as='h1' textStyle='h2' mb={6}>
					Admin Panel
				</Heading>
				<Flex gap={2} mb={8} direction={['column', undefined, 'row']}>
					<Button variant='solidPink' onClick={() => changeForm('create')}>
						Create Poem
					</Button>
					<Button variant='solidPink' onClick={() => changeForm('update')}>
						Update Poem
					</Button>
					<Button variant='solidPink' onClick={() => changeForm('delete')}>
						Delete Poem
					</Button>
				</Flex>
			</Flex>
			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Flex direction='column' w='full' maxW='4xl'>
					{activeForm === 'create' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Create Poem
							</Heading>
							<CreatePoemForm />
						</>
					)}

					{activeForm === 'update' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Update Poem
							</Heading>
							<UpdatePoemForm />
						</>
					)}

					{activeForm === 'delete' && (
						<>
							<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
								Delete Poem
							</Heading>
							<DeletePoemForm />
						</>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}

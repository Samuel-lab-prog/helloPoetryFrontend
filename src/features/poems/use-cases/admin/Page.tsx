import { Flex, Heading, Tabs } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CreatePoemForm } from '../create-poem/components/CreatePoemForm';
import { DeletePoemForm } from '../manage-poem/components/DeletePoemForm';
import { UpdatePoemForm } from '../manage-poem/components/UpdatePoemForm';

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
		<Flex as='main' layerStyle='mainPadded' direction='column' gap={8} w='full'>
			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Heading as='h1' textStyle='h2' mb={2}>
					Admin Panel
				</Heading>
			</Flex>
			<Flex as='section' direction='column' align='center' justify='center' w='full'>
				<Tabs.Root
					variant='enclosed'
					colorPalette='pink'
					value={activeForm}
					onValueChange={(details) => changeForm(details.value as ActiveForm)}
					w='full'
					maxW='4xl'
				>
					<Tabs.List
						flexWrap='wrap'
						gap={2}
						w='fit-content'
						minW='280px'
						mx='auto'
						justifyContent='center'
						bg='rgba(255, 143, 189, 0.12)'
						border='1px solid'
						borderColor='purple.700'
						borderRadius='xl'
						p={1}
						backdropFilter='blur(6px)'
					>
						<Tabs.Trigger
							value='create'
							textStyle='small'
							px={4}
							_hover={{ bg: 'rgba(255, 143, 189, 0.18)' }}
							_selected={{ bg: 'pink.500', color: 'white' }}
						>
							Create Poem
						</Tabs.Trigger>
						<Tabs.Trigger
							value='update'
							textStyle='small'
							px={4}
							_hover={{ bg: 'rgba(255, 143, 189, 0.18)' }}
							_selected={{ bg: 'pink.500', color: 'white' }}
						>
							Update Poem
						</Tabs.Trigger>
						<Tabs.Trigger
							value='delete'
							textStyle='small'
							px={4}
							_hover={{ bg: 'rgba(255, 143, 189, 0.18)' }}
							_selected={{ bg: 'pink.500', color: 'white' }}
						>
							Delete Poem
						</Tabs.Trigger>
					</Tabs.List>

					<Flex direction='column' w='full' mt={6}>
						<Tabs.Content value='create'>
							<>
								<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
									Create Poem
								</Heading>
								<CreatePoemForm />
							</>
						</Tabs.Content>
						<Tabs.Content value='update'>
							<>
								<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
									Update Poem
								</Heading>
								<UpdatePoemForm />
							</>
						</Tabs.Content>
						<Tabs.Content value='delete'>
							<>
								<Heading as='h2' textStyle='h2' mb={4} textAlign='center'>
									Delete Poem
								</Heading>
								<DeletePoemForm />
							</>
						</Tabs.Content>
					</Flex>
				</Tabs.Root>
			</Flex>
		</Flex>
	);
}

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
		<Flex
			as='main'
			layerStyle='mainPadded'
			direction='column'
			align='center'
			gap={6}
			w='full'
		>
			<Flex as='section' direction='column' align='center' justify='center' w='full' gap={3}>
				<Heading as='h1' textStyle={{ base: 'h4', md: 'h3' }} mb={0}>
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
						display='grid'
						gridTemplateColumns={{ base: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }}
						gap={2}
						w='full'
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
							px={3}
							py={2}
							_hover={{ bg: 'rgba(255, 143, 189, 0.18)' }}
							_selected={{ bg: 'pink.500', color: 'white' }}
						>
							Create Poem
						</Tabs.Trigger>
						<Tabs.Trigger
							value='update'
							textStyle='small'
							px={3}
							py={2}
							_hover={{ bg: 'rgba(255, 143, 189, 0.18)' }}
							_selected={{ bg: 'pink.500', color: 'white' }}
						>
							Update Poem
						</Tabs.Trigger>
						<Tabs.Trigger
							value='delete'
							textStyle='small'
							px={3}
							py={2}
							_hover={{ bg: 'rgba(255, 143, 189, 0.18)' }}
							_selected={{ bg: 'pink.500', color: 'white' }}
						>
							Delete Poem
						</Tabs.Trigger>
					</Tabs.List>

					<Flex direction='column' w='full' mt={5}>
						<Tabs.Content value='create'>
							<CreatePoemForm />
						</Tabs.Content>
						<Tabs.Content value='update'>
							<UpdatePoemForm />
						</Tabs.Content>
						<Tabs.Content value='delete'>
							<DeletePoemForm />
						</Tabs.Content>
					</Flex>
				</Tabs.Root>
			</Flex>
		</Flex>
	);
}

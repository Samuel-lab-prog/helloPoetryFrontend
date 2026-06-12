import { Badge, Box, Flex, Heading, IconButton, Menu, Portal } from '@chakra-ui/react';
import { EllipsisVertical } from 'lucide-react';
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
			w='full'
			maxW='2xl'
			mx='auto'
			overflowY='auto'
			scrollbarGutter='stable'
			gap={0}
		>
			<Box as='section' w='full' mb={6}>
				<Flex
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					gap={3}
					mb={3}
					flexWrap='wrap'
				>
					<Box>
						<Heading as='h1' textStyle='h3' mb={1}>
							Admin Panel
						</Heading>
						<Badge colorPalette='pink' variant='subtle' textStyle='smaller'>
							Mode:{' '}
							{activeForm === 'create'
								? 'Create Poem'
								: activeForm === 'update'
									? 'Update Poem'
									: 'Delete Poem'}
						</Badge>
					</Box>
					<Menu.Root positioning={{ placement: 'bottom-end' }}>
						<Menu.Trigger asChild>
							<IconButton
								aria-label='Select admin action'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
							>
								<EllipsisVertical size={16} />
							</IconButton>
						</Menu.Trigger>
						<Portal>
							<Menu.Positioner>
								<Menu.Content
									bg='rgba(27, 0, 25, 0.98)'
									border='1px solid'
									borderColor='purple.700'
									borderRadius='lg'
									backdropFilter='blur(6px)'
									minW='220px'
									p={1}
								>
									<Menu.Item
										value='create-poem'
										color='pink.100'
										_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
										onClick={() => changeForm('create')}
									>
										Create Poem
									</Menu.Item>
									<Menu.Item
										value='update-poem'
										color='pink.100'
										_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
										onClick={() => changeForm('update')}
									>
										Update Poem
									</Menu.Item>
									<Menu.Item
										value='delete-poem'
										color='pink.100'
										_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
										onClick={() => changeForm('delete')}
									>
										Delete Poem
									</Menu.Item>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</Flex>

				<Flex direction='column' w='full' gap={4}>
					{activeForm === 'create' && <CreatePoemForm />}
					{activeForm === 'update' && <UpdatePoemForm />}
					{activeForm === 'delete' && <DeletePoemForm />}
				</Flex>
			</Box>
		</Flex>
	);
}

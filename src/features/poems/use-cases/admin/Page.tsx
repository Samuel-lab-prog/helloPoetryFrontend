import { Surface } from '@BaseComponents';
import { Badge, Box, Button, Flex, Heading, IconButton, Menu, Portal, Text, VStack } from '@chakra-ui/react';
import {
	getBannedPrivilegeMessage,
	getSuspendedPrivilegeMessage,
	useAuthClientStore,
} from '@features/auth/public';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';

import { CreatePoemForm } from '../create-poem/components/CreatePoemForm';
import { DeletePoemForm } from '../manage-poem/components/DeletePoemForm';
import { UpdatePoemForm } from '../manage-poem/components/UpdatePoemForm';

type ActiveForm = 'create' | 'update' | 'delete';

function SuspendedPoemToolGate({ action }: { action: string }) {
	return (
		<Surface variant='gradient' maxW='2xl' w='full'>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Poems
				</Badge>
				<Heading as='h1' textStyle='h3'>
					Poem tool unavailable
				</Heading>
				<Text textStyle='small' color='pink.100'>
					{getSuspendedPrivilegeMessage(action)}
				</Text>
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/'>Go to home</NavLink>
				</Button>
			</VStack>
		</Surface>
	);
}

function BannedPoemToolGate({ action }: { action: string }) {
	return (
		<Surface variant='gradient' maxW='2xl' w='full'>
			<VStack align='start' gap={4}>
				<Badge colorPalette='pink' variant='subtle'>
					Poems
				</Badge>
				<Heading as='h1' textStyle='h3'>
					Poem tool unavailable
				</Heading>
				<Text textStyle='small' color='pink.100'>
					{getBannedPrivilegeMessage(action)}
				</Text>
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/my-profile'>Go to profile</NavLink>
				</Button>
			</VStack>
		</Surface>
	);
}

export function AdminPage() {
	const authClient = useAuthClientStore((state) => state.authClient);
	const isSuspended = authClient?.status === 'suspended';
	const isBanned = authClient?.status === 'banned';
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
					{activeForm === 'create' &&
						(isBanned ? (
							<BannedPoemToolGate action='create poems' />
						) : isSuspended ? (
							<SuspendedPoemToolGate action='create poems' />
						) : (
							<CreatePoemForm />
						))}
					{activeForm === 'update' &&
						(isBanned ? (
							<BannedPoemToolGate action='update poems' />
						) : isSuspended ? (
							<SuspendedPoemToolGate action='update poems' />
						) : (
							<UpdatePoemForm />
						))}
					{activeForm === 'delete' &&
						(isBanned ? <BannedPoemToolGate action='delete poems' /> : <DeletePoemForm />)}
				</Flex>
			</Box>
		</Flex>
	);
}

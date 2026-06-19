import { ErrorStateCard } from '@BaseComponents';
import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	HStack,
	Icon,
	IconButton,
	Menu,
	Portal,
	Text,
} from '@chakra-ui/react';
import {
	AuthRequiredCard,
	getBannedPrivilegeMessage,
	getSuspendedPrivilegeMessage,
	useAuthClientStore,
} from '@features/auth/public';
import { EllipsisVertical, House, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';

import { CreatePoemForm } from '../create-poem/components/CreatePoemForm';
import { DeletePoemForm } from '../manage-poem/components/DeletePoemForm';
import { UpdatePoemForm } from '../manage-poem/components/UpdatePoemForm';

type ActiveForm = 'create' | 'update' | 'delete';

function SuspendedPoemToolGate({ action }: { action: string }) {
	return (
		<ErrorStateCard
			maxW='2xl'
			eyebrow='POEM TOOLS UNAVAILABLE'
			title='Poem tool unavailable'
			description={getSuspendedPrivilegeMessage(action)}
			action={
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/'>
						<HStack gap={2}>
							<Icon as={House} boxSize={3.5} />
							<Text as='span'>Go to home</Text>
						</HStack>
					</NavLink>
				</Button>
			}
		/>
	);
}

function BannedPoemToolGate({ action }: { action: string }) {
	return (
		<ErrorStateCard
			maxW='2xl'
			eyebrow='POEM TOOLS UNAVAILABLE'
			title='Poem tool unavailable'
			description={getBannedPrivilegeMessage(action)}
			action={
				<Button size='sm' variant='solidPink' asChild>
					<NavLink to='/my-profile'>
						<HStack gap={2}>
							<Icon as={User} boxSize={3.5} />
							<Text as='span'>Go to profile</Text>
						</HStack>
					</NavLink>
				</Button>
			}
		/>
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

	if (!authClient?.id) {
		return (
			<Flex as='main' layerStyle='mainPadded' direction='column' align='center' w='full'>
				<AuthRequiredCard
					maxW='2xl'
					eyebrow='POEM TOOLS UNAVAILABLE'
					title='Sign in to use poem tools'
					description='This page is available only after sign in. Sign in to create, update, or delete your poems.'
				/>
			</Flex>
		);
	}

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

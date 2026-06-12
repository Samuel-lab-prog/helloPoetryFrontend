import { Flex, Heading, IconButton, Menu, Portal } from '@chakra-ui/react';
import { useEnsureRole } from '@features/auth/public/hooks/useEnsureRole';
import { EllipsisVertical } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ActionsTab } from './components/ActionsTab';
import { AnalyzeTab } from './components/PendingPoemsTab';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { usePoemModerationData } from './hooks/usePoemModerationData';

export function PoemModerationPage() {
	const navigate = useNavigate();
	const canAccess = useEnsureRole(['moderator', 'admin']);
	const [selectedView, setSelectedView] = useState<'pending' | 'actions'>('pending');

	const { pendingQuery, pendingPoems, isModeratingPoem, isRemovingPoem, handleModeration } =
		usePoemModerationData(canAccess);

	if (!canAccess) return <UnauthorizedPage onBack={() => navigate('/')} />;

	return (
		<Flex
			as='main'
			layerStyle='mainPadded'
			direction='column'
			align='center'
			w='full'
			maxW='2xl'
			mx='auto'
			flex='1'
			overflowY='auto'
			scrollbarGutter='stable'
		>
			<Flex direction='column' gap={4} w='full'>
				<Flex align='center' justify='space-between' gap={3} w='full'>
					<Heading as='h1' textStyle='h3'>
						Moderation
					</Heading>
					<Menu.Root positioning={{ placement: 'bottom-end' }}>
						<Menu.Trigger asChild>
							<IconButton aria-label='Select moderation view' size='sm' variant='solidPink'>
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
										value='pending-poems'
										color='pink.100'
										_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
										onClick={() => setSelectedView('pending')}
									>
										Pending poems
									</Menu.Item>
									<Menu.Item
										value='administrative-actions'
										color='pink.100'
										_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
										onClick={() => setSelectedView('actions')}
									>
										Administrative actions
									</Menu.Item>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</Flex>
				<Flex direction='column' gap={6} mb={4} w='full'>
					{selectedView === 'pending' ? (
						<AnalyzeTab
							pendingQuery={pendingQuery}
							pendingPoems={pendingPoems}
							isModeratingPoem={isModeratingPoem}
							isRemovingPoem={isRemovingPoem}
							onModerate={handleModeration}
						/>
					) : (
						<ActionsTab />
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}

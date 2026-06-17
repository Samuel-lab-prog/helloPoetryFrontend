import { AsyncState, EmptyStateCard, ErrorStateCard } from '@BaseComponents';
import {
	Box,
	Button,
	Flex,
	HStack,
	Icon,
	IconButton,
	Menu,
	Portal,
	Heading,
	Text,
} from '@chakra-ui/react';
import { BellOff, EllipsisVertical, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { LoadingNotificationsSkeletons } from './components/LoadingNotificationsSkeletons';
import { NotificationCard } from './components/NotificationCard';
import { useNotificationsPanel } from './hooks/useNotificationsPanel';

export function NotificationsPage() {
	const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
	const {
		notifications,
		isLoading,
		isError,
		hasMoreNotifications,
		isLoadingMoreNotifications,
		loadMoreNotifications,
		markAsRead,
		markAllAsRead,
		isMarkingAllAsRead,
		deleteNotification,
	} = useNotificationsPanel(false);

	const isRemoving = (id: number) => removingIds.has(id);
	const scheduleRemove = async (id: number): Promise<void> => {
		if (removingIds.has(id)) return;
		setRemovingIds((prev) => new Set(prev).add(id));
		await new Promise<void>((resolve) => {
			window.setTimeout(resolve, 220);
		});
		await deleteNotification(id);
		setRemovingIds((prev) => {
			const next = new Set(prev);
			next.delete(id);
			return next;
		});
	};

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
		>
			<Box as='section' w='full' mb={6}>
				<Flex
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					gap={3}
					mb={3}
					flexWrap='wrap'
				>
					<Heading as='h1' textStyle='h3'>
						Notifications
					</Heading>
					<Menu.Root positioning={{ placement: 'bottom-end' }}>
						<Menu.Trigger asChild>
							<IconButton
								aria-label='Open notification actions'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								disabled={notifications.length === 0 || isMarkingAllAsRead}
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
										value='mark-all-read'
										color='pink.100'
										_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
										onClick={() => {
											void markAllAsRead();
										}}
										disabled={notifications.length === 0}
									>
										Mark all as read
									</Menu.Item>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</Flex>

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={notifications.length === 0}
					loadingElement={LoadingNotificationsSkeletons}
					errorElement={
						<ErrorStateCard
							mt={4}
							eyebrow='NOTIFICATIONS UNAVAILABLE'
							title='We could not load your notifications right now.'
							description='Nothing was lost. Please try again in a moment, or refresh the page to reconnect.'
							actionLabel='Refresh notifications'
							onAction={() => window.location.reload()}
						/>
					}
					emptyElement={
						<EmptyStateCard
							mt={4}
							eyebrow='No notifications'
							eyebrowIcon={BellOff}
							title="You're all caught up"
							description='New likes, comments, and follow activity will appear here. If you expected something, try refreshing the page.'
							action={
								<Button
									size='sm'
									variant='solidPink'
									onClick={() => window.location.reload()}
								>
									<HStack gap={2}>
										<Icon as={RefreshCw} boxSize={3.5} />
										<Text as='span'>Refresh</Text>
									</HStack>
								</Button>
							}
							actionAlign='end'
						/>
					}
				>
					<Flex direction='column' gap={1} mb={4}>
						{notifications.map((item, index) => (
							<Box
								key={item.id}
								overflow='hidden'
								maxH={isRemoving(item.id) ? '0px' : '320px'}
								opacity={isRemoving(item.id) ? 0 : 1}
								transform={isRemoving(item.id) ? 'translateY(-6px)' : 'translateY(0)'}
								transition='max-height 0.22s ease, opacity 0.18s ease, transform 0.22s ease'
								pointerEvents={isRemoving(item.id) ? 'none' : 'auto'}
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay={`${30 + index * 30}ms`}
							>
								<NotificationCard
									item={item}
									onMarkAsRead={(id) => markAsRead(id).then(() => {})}
									onDelete={(id) => scheduleRemove(id)}
									hideTopBorder={index === 0}
								/>
							</Box>
						))}
					</Flex>
					{hasMoreNotifications && (
						<Flex justify='center' mt={4}>
							<Button
								variant='outlinePurple'
								size='xs'
								loading={isLoadingMoreNotifications}
								onClick={() => {
									void loadMoreNotifications();
								}}
							>
								Load more notifications
							</Button>
						</Flex>
					)}
				</AsyncState>
			</Box>
		</Flex>
	);
}

import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Badge, Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
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
		markAsRead,
		markAllAsRead,
		isMarkingAllAsRead,
		deleteNotification,
	} = useNotificationsPanel(false);

	const unreadCount = useAuthClientStore((state) => state.unreadNotificationsCount);
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
					<Badge
						size='sm'
						colorPalette='pink'
						variant='subtle'
						fontSize={{ base: '2xs', md: 'xs' }}
						px={{ base: 1.5, md: 2 }}
						py={{ base: 0.5, md: 1 }}
					>
						{unreadCount} Unread
					</Badge>
				</Flex>

				<Flex mb={6} gap={2} wrap='wrap'>
					<Button
						size={{ base: 'xs', md: 'sm' }}
						w='auto'
						variant='solidPink'
						onClick={() => {
							void markAllAsRead();
						}}
						disabled={notifications.length === 0}
						loading={isMarkingAllAsRead}
					>
						Mark all as read
					</Button>
				</Flex>

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={notifications.length === 0}
					loadingElement={LoadingNotificationsSkeletons}
					errorElement={
						<ErrorStateCard
							eyebrow='NOTIFICATIONS UNAVAILABLE'
							title='We could not load your notifications right now.'
							description='Nothing was lost. Please try again in a moment, or refresh the page to reconnect.'
							actionLabel='Refresh notifications'
							onAction={() => window.location.reload()}
						/>
					}
					emptyElement={<Text textStyle='small'>No notifications found.</Text>}
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
				</AsyncState>
			</Box>
		</Flex>
	);
}

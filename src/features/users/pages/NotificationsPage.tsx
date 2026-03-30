import { useState } from 'react';
import { Badge, Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { AsyncState } from '@root/core/base';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { useNotificationsPanel } from '../hooks/useNotificationsPanel';
import { NotificationCard } from '../components/NotificationCard';

export function NotificationsPage() {
	const [onlyUnread, setOnlyUnread] = useState(false);
	const { notifications, isLoading, isError, markAsRead, markAllAsRead, isMarkingAllAsRead } =
		useNotificationsPanel(onlyUnread);

	const unreadCount = useAuthClientStore((state) => state.unreadNotificationsCount);

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='4xl'>
				<Flex
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					gap={3}
					mb={6}
					flexWrap='wrap'
				>
					<Heading as='h1' textStyle='h2'>
						Notifications
					</Heading>
					<Badge colorPalette='pink' variant='subtle'>
						{unreadCount} Unread
					</Badge>
				</Flex>

				<Flex mb={6} gap={2} wrap='wrap'>
					<Button
						size={{ base: 'xs', md: 'sm' }}
						w='auto'
						variant='solidPink'
						onClick={() => setOnlyUnread((v) => !v)}
						colorPalette='gray'
					>
						{onlyUnread ? 'Show all' : 'Unread only'}
					</Button>
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
					loadingElement={<Text textStyle='body'>Loading notifications...</Text>}
					errorElement={<Text textStyle='body'>Error loading notifications.</Text>}
					emptyElement={<Text textStyle='body'>No notifications found.</Text>}
				>
					<Flex direction='column' gap={1}>
						{notifications.map((item, index) => (
							<Box
								key={item.id}
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay={`${30 + index * 30}ms`}
							>
								<NotificationCard
									item={item}
									onMarkAsRead={(id) => markAsRead(id).then(() => {})}
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

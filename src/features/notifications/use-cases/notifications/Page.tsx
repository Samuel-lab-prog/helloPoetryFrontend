import { AsyncState, ErrorStateCard } from '@BaseComponents';
import {
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
	VStack,
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
							eyebrow='NOTIFICATIONS UNAVAILABLE'
							title='We could not load your notifications right now.'
							description='Nothing was lost. Please try again in a moment, or refresh the page to reconnect.'
							actionLabel='Refresh notifications'
							onAction={() => window.location.reload()}
						/>
					}
					emptyElement={
						<Box mt={4}>
							<Box
								w='full'
								role='status'
								aria-live='polite'
								position='relative'
								overflow='hidden'
								borderRadius='2xl'
								border='1px solid'
								borderColor='purple.700'
								bgGradient='linear(to-br, rgba(42, 21, 57, 0.92), rgba(30, 20, 46, 0.98) 55%, rgba(25, 31, 58, 0.96))'
								p={{ base: 5, md: 6 }}
								shadow='0 12px 30px rgba(0,0,0,0.28)'
								_before={{
									content: '""',
									position: 'absolute',
									inset: '-40px auto auto -30px',
									w: '180px',
									h: '180px',
									borderRadius: 'full',
									bg: 'pink.500',
									filter: 'blur(70px)',
									opacity: 0.14,
								}}
								_after={{
									content: '""',
									position: 'absolute',
									inset: 'auto -50px -60px auto',
									w: '200px',
									h: '200px',
									borderRadius: 'full',
									bg: 'purple.500',
									filter: 'blur(75px)',
									opacity: 0.18,
								}}
							>
								<VStack align='start' gap={4} position='relative' zIndex={1}>
									<HStack
										px={3}
										py={2}
										borderRadius='full'
										bg='rgba(255, 255, 255, 0.06)'
										border='1px solid'
										borderColor='rgba(255, 255, 255, 0.08)'
										gap={2}
									>
										<Icon as={BellOff} boxSize={4.5} color='pink.200' />
										<Text
											textStyle='smaller'
											color='pink.200'
											letterSpacing='0.08em'
											textTransform='uppercase'
										>
											No notifications
										</Text>
									</HStack>

									<VStack align='start' gap={2} maxW='md'>
										<Heading as='h2' textStyle='h4' color='white' mb={0}>
											You're all caught up
										</Heading>
										<Text textStyle='smaller' color='pink.100'>
											New likes, comments, and follow activity will appear here. If you expected
											something, try refreshing the page.
										</Text>
									</VStack>

									<Button
										size='sm'
										variant='solidPink'
										onClick={() => window.location.reload()}
										alignSelf='end'
									>
										<HStack gap={2}>
											<Icon as={RefreshCw} boxSize={3.5} />
											<Text as='span'>Refresh</Text>
										</HStack>
									</Button>
								</VStack>
							</Box>
						</Box>
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
				</AsyncState>
			</Box>
		</Flex>
	);
}

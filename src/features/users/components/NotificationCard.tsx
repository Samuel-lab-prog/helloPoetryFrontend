import { NavLink } from 'react-router-dom';
import { Avatar, Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { formatRelativeTime } from '@BaseComponents';
import type { NotificationItem } from '../hooks/useNotificationsPanel';

function getNotificationBody(item: NotificationItem): string {
	const body = item.data?.body?.trim();
	if (body) return body;
	if (item.aggregatedCount > 1) {
		return `You received ${item.aggregatedCount} notifications of this type.`;
	}
	return 'No additional details.';
}

function getNotificationActorName(item: NotificationItem): string {
	return (
		item.data?.requesterNickname ??
		item.data?.likerNickname ??
		item.data?.commenterNickname ??
		item.data?.dedicatorNickname ??
		item.data?.replierNickname ??
		item.data?.newFriendNickname ??
		'User'
	);
}

function getNotificationLink(item: NotificationItem) {
	const poemId = item.data?.poemId;
	const poemSlug = item.data?.poemSlug;
	if (poemId && poemId > 0 && poemSlug) return `/poems/${poemSlug}/${poemId}`;
	if (poemId && poemId > 0) return `/poems/${poemId}`;

	if (item.entityType === 'POEM' && item.entityId) return `/poems/${item.entityId}`;

	const userId = item.data?.newFriendId ?? item.data?.requesterId;
	if (userId && userId > 0) return `/authors/${userId}`;

	if (item.entityType === 'USER' && item.entityId) return `/authors/${item.entityId}`;

	return null;
}

type NotificationCardProps = {
	item: NotificationItem;
	onMarkAsRead: (id: number) => Promise<void>;
	hideTopBorder?: boolean;
};

export function NotificationCard({ item, onMarkAsRead, hideTopBorder }: NotificationCardProps) {
	const link = getNotificationLink(item);
	const relativeCreatedAt = formatRelativeTime(item.createdAt);
	const avatarUrl = item.data?.avatarUrl ?? item.data?.actorAvatarUrl ?? null;
	const actorName = getNotificationActorName(item);

	const cardContent = (
		<Box py={2}>
			<Flex align='start' gap={3}>
				<HStack align='start' gap={3} flex='1' minW={0}>
					<Avatar.Root size='md'>
						<Avatar.Image src={avatarUrl ?? undefined} />
						<Avatar.Fallback name={actorName} />
					</Avatar.Root>
					<VStack align='start' gap={1} flex='1' minW={0}>
						<Text color='pink.100' fontWeight='semibold' lineHeight='short'>
							{getNotificationBody(item)}
						</Text>
						<Flex align='center' justify='space-between' w='full' gap={2}>
							{relativeCreatedAt && (
								<Text variant='caption' color='pink.300'>
									{relativeCreatedAt}
								</Text>
							)}
							{item.readAt && (
								<Text variant='caption' color='pink.200'>
									Read
								</Text>
							)}
						</Flex>
						<HStack gap={2} wrap='wrap'>
							{item.aggregatedCount > 1 && (
								<Badge size='sm' colorPalette='pink' variant='subtle'>
									{item.aggregatedCount} notifications
								</Badge>
							)}
						</HStack>
					</VStack>
				</HStack>

				<Box />
			</Flex>
		</Box>
	);

	return (
		<Box
			as={link ? NavLink : 'div'}
			to={link ?? undefined}
			display='block'
			borderTop={hideTopBorder ? 'none' : '1px solid'}
			borderColor={hideTopBorder ? 'transparent' : 'purple.700'}
			onClick={() => {
				if (!link) return;
				if (item.readAt) return;
				void onMarkAsRead(item.id);
			}}
			_hover={
				link
					? {
							bg: 'rgba(255, 255, 255, 0.03)',
							borderColor: 'purple.600',
						}
					: undefined
			}
			transition={link ? 'background 0.2s ease, border-color 0.2s ease' : undefined}
		>
			{cardContent}
		</Box>
	);
}

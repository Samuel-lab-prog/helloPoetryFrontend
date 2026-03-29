import { NavLink } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Avatar, Badge, Card, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { formatRelativeTime } from '@root/core/base';
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

function getAccentForType(type: string) {
	switch (type) {
		case 'NEW_FRIEND':
		case 'NEW_FRIEND_REQUEST':
			return 'purple.400';
		case 'POEM_DEDICATED':
			return 'pink.300';
		case 'POEM_COMMENT_CREATED':
		case 'POEM_COMMENT_REPLIED':
			return 'pink.400';
		case 'POEM_LIKED':
			return 'pink.500';
		default:
			return 'purple.500';
	}
}

type NotificationCardProps = {
	item: NotificationItem;
	onMarkAsRead: (id: number) => Promise<void>;
	isMarkingAsRead: boolean;
};

export function NotificationCard({ item, onMarkAsRead, isMarkingAsRead }: NotificationCardProps) {
	const link = getNotificationLink(item);
	const accentColor = getAccentForType(item.type);
	const relativeCreatedAt = formatRelativeTime(item.createdAt);
	const avatarUrl = item.data?.avatarUrl ?? item.data?.actorAvatarUrl ?? null;
	const actorName = getNotificationActorName(item);

	const cardContent = (
		<Card.Body>
			<Flex align='start' justify='space-between' gap={3}>
				<HStack align='start' gap={3} flex='1' minW={0}>
					<Avatar.Root size='md'>
						<Avatar.Image src={avatarUrl ?? undefined} />
						<Avatar.Fallback name={actorName} />
					</Avatar.Root>
					<VStack align='start' gap={2} flex='1' minW={0}>
						<Text color='pink.100' fontWeight='semibold'>
							{getNotificationBody(item)}
						</Text>
						{relativeCreatedAt && (
							<Text variant='caption' color='pink.300'>
								{relativeCreatedAt}
							</Text>
						)}
						<HStack gap={2} wrap='wrap'>
							{item.aggregatedCount > 1 && (
								<Badge size='sm' colorPalette='pink' variant='subtle'>
									{item.aggregatedCount} notifications
								</Badge>
							)}
							{item.readAt && (
								<Badge size='sm' colorPalette='gray' variant='subtle'>
									Read
								</Badge>
							)}
						</HStack>
					</VStack>
				</HStack>

				<HStack gap={2} align='start'>
					{!item.readAt && (
						<IconButton
							size='sm'
							variant='solidPink'
							aria-label='Mark as read'
							title='Mark as read'
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								void onMarkAsRead(item.id);
							}}
							loading={isMarkingAsRead}
						>
							<Check size={16} />
						</IconButton>
					)}
				</HStack>
			</Flex>
		</Card.Body>
	);

	return (
		<Card.Root
			asChild={Boolean(link)}
			variant='interactive'
			size='sm'
			borderColor={item.readAt ? 'purple.700' : 'pink.400'}
			borderLeft='4px solid'
			borderLeftColor={accentColor}
		>
			{link ? (
				<NavLink to={link} style={{ display: 'block' }}>
					{cardContent}
				</NavLink>
			) : (
				cardContent
			)}
		</Card.Root>
	);
}

import { NavLink } from 'react-router-dom';
import { Eye, Check, Trash2 } from 'lucide-react';
import { Badge, Card, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { formatDate } from '@root/core/base';
import type { NotificationItem } from '../hooks/useNotificationsPanel';

function getFallbackTitle(type: string) {
	switch (type) {
		case 'POEM_COMMENT_CREATED':
			return 'New comment';
		case 'NEW_FRIEND':
			return 'New friend';
		case 'NEW_FRIEND_REQUEST':
			return 'Friend request';
		case 'POEM_LIKED':
			return 'Your poem was liked';
		case 'POEM_COMMENT_REPLIED':
			return 'New reply to your comment';
		case 'POEM_DEDICATED':
			return 'Poem dedicated';
		case 'USER_MENTION_IN_POEM':
			return 'You were mentioned';
		default:
			return 'Notification';
	}
}

function getNotificationTitle(item: NotificationItem): string {
	return item.data?.title?.trim() || getFallbackTitle(item.type);
}

function getNotificationBody(item: NotificationItem): string {
	const body = item.data?.body?.trim();
	if (body) return body;
	if (item.aggregatedCount > 1) {
		return `You received ${item.aggregatedCount} notifications of this type.`;
	}
	return 'No additional details.';
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
	onDelete: (id: number) => Promise<void>;
	isMarkingAsRead: boolean;
	isDeleting: boolean;
};

export function NotificationCard({
	item,
	onMarkAsRead,
	onDelete,
	isMarkingAsRead,
	isDeleting,
}: NotificationCardProps) {
	const link = getNotificationLink(item);
	const accentColor = getAccentForType(item.type);

	return (
		<Card.Root
			variant='interactive'
			size='sm'
			borderColor={item.readAt ? 'purple.700' : 'pink.400'}
			borderLeft='4px solid'
			borderLeftColor={accentColor}
		>
			<Card.Header pb={2}>
				<Flex direction='column' gap={1} flex='1'>
					<Text color='pink.100' fontWeight='semibold'>
						{getNotificationTitle(item)}
					</Text>
					<Text variant='muted'>{getNotificationBody(item)}</Text>
				</Flex>
			</Card.Header>

			<Card.Body pt={0}>
				<Flex align='start' justify='space-between' gap={3}>
					<VStack align='start' gap={2} flex='1' minW={0}>
						<Text variant='caption' color='pink.300'>
							{formatDate(item.createdAt)}
						</Text>
						<HStack gap={2} wrap='wrap'>
							<Badge size='sm' colorPalette='purple' variant='subtle'>
								{item.type}
							</Badge>
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

					<HStack gap={2} align='start'>
						{link && (
							<IconButton
								asChild
								size='sm'
								variant='solidPink'
								aria-label='Open notification'
								title='Open'
							>
								<NavLink to={link}>
									<Eye size={16} />
								</NavLink>
							</IconButton>
						)}
						{!item.readAt && (
							<IconButton
								size='sm'
								variant='solidPink'
								aria-label='Mark as read'
								title='Mark as read'
								onClick={() => {
									void onMarkAsRead(item.id);
								}}
								loading={isMarkingAsRead}
							>
								<Check size={16} />
							</IconButton>
						)}
						<IconButton
							size='sm'
							variant='danger'
							aria-label='Delete notification'
							title='Delete'
							onClick={() => {
								void onDelete(item.id);
							}}
							loading={isDeleting}
						>
							<Trash2 size={16} />
						</IconButton>
					</HStack>
				</Flex>
			</Card.Body>
		</Card.Root>
	);
}

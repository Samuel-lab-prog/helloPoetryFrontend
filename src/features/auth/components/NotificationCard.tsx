import { NavLink } from 'react-router-dom';
import { Badge, Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import { formatDate } from '@features/base';
import type { NotificationItem } from '../hooks/useNotificationsPanel';

function getFallbackTitle(type: string) {
	switch (type) {
		case 'POEM_COMMENT_CREATED':
			return 'Novo comentário';
		case 'NEW_FRIEND':
			return 'Novo amigo';
		case 'NEW_FRIEND_REQUEST':
			return 'Pedido de amizade';
		case 'POEM_LIKED':
			return 'Poema curtido';
		case 'POEM_COMMENT_REPLIED':
			return 'Resposta em comentário';
		case 'POEM_DEDICATED':
			return 'Poema dedicado';
		case 'USER_MENTION_IN_POEM':
			return 'Você foi mencionado';
		default:
			return 'Notificação';
	}
}

function getNotificationTitle(item: NotificationItem) {
	return item.data?.title?.trim() || getFallbackTitle(item.type);
}

function getNotificationBody(item: NotificationItem) {
	const body = item.data?.body?.trim();
	if (body) return body;
	if (item.aggregatedCount > 1) {
		return `Você recebeu ${item.aggregatedCount} notificações desse tipo.`;
	}
	return 'Sem detalhes adicionais.';
}

function getNotificationLink(item: NotificationItem) {
	const poemId = item.data?.poemId;
	if (poemId && poemId > 0) return `/poems/${poemId}`;

	if (item.entityType === 'POEM' && item.entityId)
		return `/poems/${item.entityId}`;

	const userId = item.data?.newFriendId ?? item.data?.requesterId;
	if (userId && userId > 0) return `/authors/${userId}`;

	if (item.entityType === 'USER' && item.entityId)
		return `/authors/${item.entityId}`;

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
		<Box
			p={4}
			border='1px solid'
			borderColor={item.readAt ? 'purple.700' : 'pink.400'}
			borderLeft='4px solid'
			borderLeftColor={accentColor}
			borderRadius='lg'
			bg='rgba(255, 255, 255, 0.02)'
		>
			<Flex
				justify='space-between'
				align='start'
				gap={4}
				direction={{ base: 'column', md: 'row' }}
			>
				<Flex
					direction='column'
					gap={1}
					flex='1'
				>
					<Text
						textStyle='small'
						color='pink.100'
						fontWeight='semibold'
					>
						{getNotificationTitle(item)}
					</Text>
					<Text
						textStyle='small'
						color='pink.200'
					>
						{getNotificationBody(item)}
					</Text>
					<Text
						textStyle='smaller'
						color='pink.300'
					>
						{formatDate(item.createdAt)}
					</Text>
					<HStack
						gap={2}
						wrap='wrap'
						mt={1}
					>
						<Badge
							size='sm'
							colorPalette='purple'
							variant='subtle'
						>
							{item.type}
						</Badge>
						{item.aggregatedCount > 1 && (
							<Badge
								size='sm'
								colorPalette='pink'
								variant='subtle'
							>
								{item.aggregatedCount} notificações
							</Badge>
						)}
						{item.readAt && (
							<Badge
								size='sm'
								colorPalette='gray'
								variant='subtle'
							>
								Lida
							</Badge>
						)}
					</HStack>
				</Flex>

				<HStack
					gap={2}
					alignSelf={{ base: 'stretch', md: 'start' }}
				>
					{link && (
						<Button
							size={{ base: 'xs', md: 'sm' }}
							variant='solidPink'
							asChild
						>
							<NavLink to={link}>Abrir</NavLink>
						</Button>
					)}
					{!item.readAt && (
						<Button
							size={{ base: 'xs', md: 'sm' }}
							variant='solidPink'
							onClick={() => {
								void onMarkAsRead(item.id);
							}}
							loading={isMarkingAsRead}
						>
							Marcar como lida
						</Button>
					)}
					<Button
						size={{ base: 'xs', md: 'sm' }}
						variant='solidPink'
						colorPalette='gray'
						onClick={() => {
							void onDelete(item.id);
						}}
						loading={isDeleting}
					>
						Excluir
					</Button>
				</HStack>
			</Flex>
		</Box>
	);
}

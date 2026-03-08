import { NavLink } from 'react-router-dom';
import { Eye, Check, Trash2 } from 'lucide-react';
import { Badge, Card, Flex, HStack, IconButton, Text, VStack } from '@chakra-ui/react';
import { formatDate } from '@features/base';
import type { NotificationItem } from '../hooks/useNotificationsPanel';

function getFallbackTitle(type: string) {
	switch (type) {
		case 'POEM_COMMENT_CREATED':
			return 'Novo comentario';
		case 'NEW_FRIEND':
			return 'Novo amigo';
		case 'NEW_FRIEND_REQUEST':
			return 'Pedido de amizade';
		case 'POEM_LIKED':
			return 'Poema curtido';
		case 'POEM_COMMENT_REPLIED':
			return 'Resposta em comentario';
		case 'POEM_DEDICATED':
			return 'Poema dedicado';
		case 'USER_MENTION_IN_POEM':
			return 'Voce foi mencionado';
		default:
			return 'Notificacao';
	}
}

function getNotificationTitle(item: NotificationItem): string {
	return item.data?.title?.trim() || getFallbackTitle(item.type);
}

function getNotificationBody(item: NotificationItem): string {
	const body = item.data?.body?.trim();
	if (body) return body;
	if (item.aggregatedCount > 1) {
		return `Voce recebeu ${item.aggregatedCount} notificacoes desse tipo.`;
	}
	return 'Sem detalhes adicionais.';
}

function getNotificationLink(item: NotificationItem) {
	const poemId = item.data?.poemId;
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
									{item.aggregatedCount} notificacoes
								</Badge>
							)}
							{item.readAt && (
								<Badge size='sm' colorPalette='gray' variant='subtle'>
									Lida
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
								aria-label='Abrir notificacao'
								title='Abrir'
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
								aria-label='Marcar como lida'
								title='Marcar como lida'
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
							aria-label='Excluir notificacao'
							title='Excluir'
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

import { useState } from 'react';
import { Box, Button, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { AsyncState, formatDate } from '@features/base';
import { useNotificationsPanel } from '../hooks/useNotificationsPanel';

function getNotificationTitle(type: string) {
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

export function NotificationsPage() {
	const [onlyUnread, setOnlyUnread] = useState(false);
	const {
		notifications,
		isLoading,
		isError,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		isMarkingAsRead,
		isMarkingAllAsRead,
		isDeleting,
	} = useNotificationsPanel(onlyUnread);

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='4xl'>
				<Heading as='h1' textStyle='h1' mb={6}>
					Notifications
				</Heading>

				<HStack mb={6} gap={3} wrap='wrap'>
					<Button
						variant='surface'
						onClick={() => setOnlyUnread((v) => !v)}
						colorPalette='gray'
					>
						{onlyUnread ? 'Mostrar todas' : 'Somente nao lidas'}
					</Button>
					<Button
						variant='surface'
						onClick={() => markAllAsRead()}
						disabled={notifications.length === 0}
						loading={isMarkingAllAsRead}
					>
						Marcar todas como lidas
					</Button>
				</HStack>

				<AsyncState
					isLoading={isLoading}
					isError={isError}
					isEmpty={notifications.length === 0}
					loadingElement={<Text textStyle='body'>Carregando notificacoes...</Text>}
					errorElement={<Text textStyle='body'>Erro ao carregar notificacoes.</Text>}
					emptyElement={<Text textStyle='body'>Nenhuma notificacao encontrada.</Text>}
				>
					<Flex direction='column' gap={3}>
						{notifications.map((item) => (
							<Box
								key={item.id}
								p={4}
								border='1px solid'
								borderColor={item.readAt ? 'purple.700' : 'pink.400'}
								borderRadius='lg'
								bg='rgba(255, 255, 255, 0.02)'
							>
								<Flex justify='space-between' align='start' gap={4}>
									<Flex direction='column' gap={1}>
										<Text textStyle='small' color='pink.100'>
											{getNotificationTitle(item.type)}
										</Text>
										<Text textStyle='smaller' color='pink.200'>
											Tipo: {item.type}
										</Text>
										<Text textStyle='smaller' color='pink.200'>
											{formatDate(item.createdAt)}
										</Text>
										{item.aggregatedCount > 1 && (
											<Text textStyle='smaller' color='pink.200'>
												Ocorrencias: {item.aggregatedCount}
											</Text>
										)}
									</Flex>

									<HStack gap={2}>
										{!item.readAt && (
											<Button
												size='sm'
												variant='surface'
												onClick={() => markAsRead(item.id)}
												loading={isMarkingAsRead}
											>
												Marcar lida
											</Button>
										)}
										<Button
											size='sm'
											variant='surface'
											colorPalette='gray'
											onClick={() => deleteNotification(item.id)}
											loading={isDeleting}
										>
											Excluir
										</Button>
									</HStack>
								</Flex>
							</Box>
						))}
					</Flex>
				</AsyncState>
			</Box>
		</Flex>
	);
}

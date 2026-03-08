import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
} from '@chakra-ui/react';
import { AsyncState } from '@features/base';
import { useNotificationsPanel } from '../hooks/useNotificationsPanel';
import { NotificationCard } from '../components/NotificationCard';

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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.readAt).length,
    [notifications],
  );

  return (
    <Flex
      as='main'
      layerStyle='main'
      direction='column'
      align='center'
    >
      <Box
        as='section'
        w='full'
        maxW='4xl'
      >
        <Flex
          align={{ base: 'start', md: 'center' }}
          justify='space-between'
          gap={3}
          mb={6}
          flexWrap='wrap'
        >
          <Heading
            as='h1'
            textStyle='h2'
          >
            Notificações
          </Heading>
          <Badge
            colorPalette='pink'
            variant='subtle'
          >
            {unreadCount} Não lidas
          </Badge>
        </Flex>

        <HStack
          mb={6}
          gap={2}
          wrap='wrap'
        >
          <Button
            size={{ base: 'xs', md: 'sm' }}
            variant='solidPink'
            onClick={() => setOnlyUnread((v) => !v)}
            colorPalette='gray'
          >
            {onlyUnread ? 'Mostrar todas' : 'Somente não lidas'}
          </Button>
          <Button
            size={{ base: 'xs', md: 'sm' }}
            variant='solidPink'
            onClick={() => {
              void markAllAsRead();
            }}
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
          loadingElement={
            <Text textStyle='body'>Carregando notificações...</Text>
          }
          errorElement={
            <Text textStyle='body'>Erro ao carregar notificações.</Text>
          }
          emptyElement={
            <Text textStyle='body'>Nenhuma notificação encontrada.</Text>
          }
        >
          <Flex
            direction='column'
            gap={3}
          >
            {notifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onMarkAsRead={(id) => markAsRead(id).then(() => { })}
                onDelete={(id) => deleteNotification(id).then(() => { })}
                isMarkingAsRead={isMarkingAsRead}
                isDeleting={isDeleting}
              />
            ))}
          </Flex>
        </AsyncState>
      </Box>
    </Flex>
  );
}

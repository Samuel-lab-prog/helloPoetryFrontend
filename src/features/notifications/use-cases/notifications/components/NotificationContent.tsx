import type { NotificationItem } from '@Api/notifications/types';
import { Avatar, Badge, Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';

import { getNotificationBody } from '../utils/notificationText';

type NotificationContentProps = {
	item: NotificationItem;
	actorName: string;
	avatarUrl: string | null;
	relativeCreatedAt: string | null;
	isRead: boolean;
};

export function NotificationContent({
	item,
	actorName,
	avatarUrl,
	relativeCreatedAt,
	isRead,
}: NotificationContentProps) {
	return (
		<Box py={2}>
			<Flex align='start' gap={3}>
				<HStack align='start' gap={3} flex='1' minW={0}>
					<Avatar.Root size='md'>
						<Avatar.Image src={avatarUrl ?? undefined} />
						<Avatar.Fallback name={actorName} />
					</Avatar.Root>
					<VStack align='start' gap={1} flex='1' minW={0}>
						<Text
							color='pink.100'
							fontWeight='semibold'
							lineHeight='short'
							opacity={isRead ? 0.65 : 1}
						>
							{getNotificationBody(item)}
						</Text>
						<Flex align='center' justify='space-between' w='full' gap={2}>
							{relativeCreatedAt && (
								<Text variant='caption' color='pink.300' opacity={isRead ? 0.6 : 1}>
									{relativeCreatedAt}
								</Text>
							)}
						</Flex>
						<HStack gap={2} wrap='wrap'>
							{item.aggregatedCount > 1 && (
								<Badge size='sm' colorPalette='pink' variant='subtle' opacity={isRead ? 0.7 : 1}>
									{item.aggregatedCount} notifications
								</Badge>
							)}
						</HStack>
					</VStack>
				</HStack>
			</Flex>
		</Box>
	);
}

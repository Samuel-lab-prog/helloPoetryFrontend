import type { NotificationItem } from '@Api/notifications/types';
import { Box, Button, IconButton, LinkBox, LinkOverlay, useBreakpointValue } from '@chakra-ui/react';
import { formatRelativeTime } from '@Utils';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useNotificationSwipe } from '../hooks/useNotificationSwipe';
import { getNotificationActorName, getNotificationLink } from '../utils/notificationText';
import { NotificationContent } from './NotificationContent';

type NotificationCardProps = {
	item: NotificationItem;
	onMarkAsRead: (id: number) => Promise<void>;
	onDelete?: (id: number) => Promise<void>;
	hideTopBorder?: boolean;
};

export function NotificationCard({
	item,
	onMarkAsRead,
	onDelete,
	hideTopBorder,
}: NotificationCardProps) {
	const link = getNotificationLink(item);
	const relativeCreatedAt = formatRelativeTime(item.createdAt);
	const avatarUrl = item.data?.avatarUrl ?? item.data?.actorAvatarUrl ?? null;
	const actorName = getNotificationActorName(item);
	const isMobile = useBreakpointValue({ base: true, lg: false }) ?? true;
	const [showDelete, setShowDelete] = useState(false);
	const swipe = useNotificationSwipe();

	const cardContent = (
		<NotificationContent
			item={item}
			actorName={actorName}
			avatarUrl={avatarUrl}
			relativeCreatedAt={relativeCreatedAt}
			isRead={!!item.readAt}
		/>
	);

	const sharedProps = {
		display: 'block',
		borderTop: hideTopBorder ? 'none' : '1px solid',
		borderColor: hideTopBorder ? 'transparent' : 'purple.700',
		bg: item.readAt ? 'rgba(255, 255, 255, 0.01)' : undefined,
		_hover: link
			? {
					bg: 'rgba(255, 255, 255, 0.03)',
					borderColor: 'purple.600',
				}
			: undefined,
		transition: link ? 'background 0.2s ease, border-color 0.2s ease' : undefined,
	} as const;

	if (!isMobile) {
		return (
			<LinkBox
				{...sharedProps}
				role='group'
				position='relative'
				pr={onDelete ? 10 : undefined}
				onMouseEnter={() => setShowDelete(true)}
				onMouseLeave={() => setShowDelete(false)}
			>
				<Box position='relative' zIndex={1}>
					{link ? (
						<LinkOverlay
							asChild
							onClick={() => {
								if (item.readAt) return;
								void onMarkAsRead(item.id);
							}}
							zIndex={1}
						>
							<NavLink to={link}>{cardContent}</NavLink>
						</LinkOverlay>
					) : (
						cardContent
					)}
				</Box>
				{onDelete && (
					<Box
						position='absolute'
						right={3}
						top='50%'
						transform='translateY(-50%)'
						opacity={showDelete ? 1 : 0}
						transition='opacity 0.2s ease'
						zIndex={2}
						pointerEvents={showDelete ? 'auto' : 'none'}
					>
						<IconButton
							aria-label='Delete notification'
							variant='ghost'
							size='sm'
							colorPalette='pink'
							onClick={(event) => {
								event.stopPropagation();
								event.preventDefault();
								void onDelete?.(item.id);
							}}
						>
							<Trash2 size={16} />
						</IconButton>
					</Box>
				)}
			</LinkBox>
		);
	}

	const content = (
		<LinkBox
			{...sharedProps}
			position='relative'
			overflow='hidden'
			touchAction='pan-y'
			onTouchStart={swipe.handleTouchStart}
			onTouchMove={swipe.handleTouchMove}
			onTouchEnd={swipe.handleTouchEnd}
		>
			<Box
				position='absolute'
				right={0}
				top={0}
				bottom={0}
				w='72px'
				display='flex'
				alignItems='center'
				justifyContent='center'
				bg='rgba(145, 26, 58, 0.85)'
				borderLeft='1px solid'
				borderColor='purple.700'
				opacity={swipe.isOpen ? 1 : 0}
				pointerEvents={swipe.isOpen ? 'auto' : 'none'}
				transition='opacity 0.2s ease'
			>
				<Button
					aria-label='Delete notification'
					variant='solid'
					size='sm'
					colorPalette='pink'
					w='full'
					h='full'
					borderRadius='none'
					onClick={(event) => {
						event.stopPropagation();
						event.preventDefault();
						void onDelete?.(item.id);
						swipe.close();
					}}
				>
					<Trash2 size={16} />
				</Button>
			</Box>

			<Box
				transform={`translateX(${swipe.offsetX}px)`}
				transition={swipe.isDragging ? 'none' : 'transform 0.2s ease'}
			>
				{link ? (
					<LinkOverlay
						asChild
						onClick={(event) => {
							if (swipe.isOpen) {
								event.preventDefault();
								swipe.close();
								return;
							}
							if (item.readAt) return;
							void onMarkAsRead(item.id);
						}}
					>
						<NavLink to={link}>{cardContent}</NavLink>
					</LinkOverlay>
				) : (
					cardContent
				)}
			</Box>
		</LinkBox>
	);

	if (link)
		return (
			<Box onClick={() => swipe.isOpen && swipe.close()} role='group'>
				{content}
			</Box>
		);

	return content;
}

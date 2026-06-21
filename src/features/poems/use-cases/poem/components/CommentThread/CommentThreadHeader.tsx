import { Avatar, Box, Flex, IconButton, Link, Text } from '@chakra-ui/react';
import { type PoemCommentType } from '@features/interactions/public';
import { formatRelativeTime } from '@Utils';
import { MessageCircleReply, Trash2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface CommentThreadHeaderProps {
	comment: PoemCommentType;
	parentAuthorId?: number;
	parentAuthorNickname?: string;
	parentAuthorUnavailable?: boolean;
	authClientId: number;
	isDeletingComment: boolean;
	isAuthenticated: boolean;
	isReplyComposerOpen: boolean;
	onDelete: () => Promise<void>;
	onToggleReplyComposer: () => void;
}

export function CommentThreadHeader({
	comment,
	parentAuthorId,
	parentAuthorNickname,
	parentAuthorUnavailable,
	authClientId,
	isDeletingComment,
	isAuthenticated,
	isReplyComposerOpen,
	onDelete,
	onToggleReplyComposer,
}: CommentThreadHeaderProps) {
	const isAuthorUnavailable = comment.author.isUnavailable === true;
	const authorLabel = isAuthorUnavailable ? 'Unavailable user' : `@${comment.author.nickname}`;
	const canActOnComment = !isAuthorUnavailable;

	return (
		<Flex align='stretch' gap={3} w='full'>
			<Box flex='1' minW={0}>
				<Flex align='center' gap={2} mb={2}>
					<Avatar.Root size='xs'>
						<Avatar.Image
							src={isAuthorUnavailable ? undefined : (comment.author.avatarUrl ?? undefined)}
						/>
						<Avatar.Fallback name={authorLabel} />
					</Avatar.Root>
					<Box>
						{isAuthorUnavailable ? (
							<Text textStyle='smaller' color='pink.200'>
								{authorLabel}
							</Text>
						) : (
							<Link
								asChild
								textStyle='smaller'
								color='pink.200'
								textDecoration='underline'
								textUnderlineOffset='3px'
								_hover={{ color: 'pink.100' }}
								_focusVisible={{
									outline: '2px solid',
									outlineColor: 'pink.300',
									outlineOffset: '2px',
								}}
							>
								<NavLink to={`/authors/${comment.author.id}`}>{authorLabel}</NavLink>
							</Link>
						)}
						<Text textStyle='smaller' color='pink.200'>
							{formatRelativeTime(comment.createdAt)}
						</Text>
					</Box>
				</Flex>
				<Text
					textStyle='smaller'
					color={isAuthorUnavailable ? 'pink.200' : undefined}
					fontStyle={isAuthorUnavailable ? 'italic' : undefined}
					opacity={isAuthorUnavailable ? 0.9 : undefined}
				>
					{parentAuthorId && parentAuthorNickname && (
						<>
							{parentAuthorUnavailable ? (
								<Text as='span' color='pink.200'>
									Unavailable user
								</Text>
							) : (
								<Link asChild color='pink.200' textDecoration='underline' textUnderlineOffset='3px'>
									<NavLink to={`/authors/${parentAuthorId}`}>@{parentAuthorNickname}</NavLink>
								</Link>
							)}{' '}
						</>
					)}
					{comment.content}
				</Text>
			</Box>
			<Flex direction='column' align='center' alignSelf='stretch'>
				{canActOnComment && comment.author.id === authClientId && (
					<IconButton
						size='xs'
						variant='ghost'
						colorPalette='red'
						aria-label='Delete comment'
						title='Delete comment'
						loading={isDeletingComment}
						onClick={onDelete}
					>
						<Trash2 />
					</IconButton>
				)}
				<IconButton
					mt='auto'
					size='xs'
					variant='ghost'
					colorPalette='pink'
					aria-label={isReplyComposerOpen ? 'Close reply' : 'Reply to comment'}
					title={isReplyComposerOpen ? 'Close reply' : 'Reply to comment'}
					disabled={!isAuthenticated || !canActOnComment}
					onClick={onToggleReplyComposer}
				>
					<MessageCircleReply />
				</IconButton>
			</Flex>
		</Flex>
	);
}

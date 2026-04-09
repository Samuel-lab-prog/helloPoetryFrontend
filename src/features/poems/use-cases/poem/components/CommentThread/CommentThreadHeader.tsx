import { Avatar, Box, Flex, IconButton, Link, Text } from '@chakra-ui/react';
import { type PoemCommentType } from '@features/interactions/public';
import { formatRelativeTime } from '@Utils';
import { MessageCircleReply, Trash2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface CommentThreadHeaderProps {
	comment: PoemCommentType;
	parentAuthorId?: number;
	parentAuthorNickname?: string;
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
	authClientId,
	isDeletingComment,
	isAuthenticated,
	isReplyComposerOpen,
	onDelete,
	onToggleReplyComposer,
}: CommentThreadHeaderProps) {
	return (
		<Flex align='stretch' gap={3} w='full'>
			<Box flex='1' minW={0}>
				<Flex align='center' gap={2} mb={2}>
					<Avatar.Root size='xs'>
						<Avatar.Image src={comment.author.avatarUrl ?? undefined} />
						<Avatar.Fallback name={comment.author.nickname} />
					</Avatar.Root>
					<Box>
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
							<NavLink to={`/authors/${comment.author.id}`}>@{comment.author.nickname}</NavLink>
						</Link>
						<Text textStyle='smaller' color='pink.200'>
							{formatRelativeTime(comment.createdAt)}
						</Text>
					</Box>
				</Flex>
				<Text textStyle='small'>
					{parentAuthorId && parentAuthorNickname && (
						<>
							<Link asChild color='pink.200' textDecoration='underline' textUnderlineOffset='3px'>
								<NavLink to={`/authors/${parentAuthorId}`}>@{parentAuthorNickname}</NavLink>
							</Link>{' '}
						</>
					)}
					{comment.content}
				</Text>
			</Box>
			<Flex direction='column' align='center' alignSelf='stretch'>
				{comment.author.id === authClientId && (
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
					disabled={!isAuthenticated}
					onClick={onToggleReplyComposer}
				>
					<MessageCircleReply />
				</IconButton>
			</Flex>
		</Flex>
	);
}

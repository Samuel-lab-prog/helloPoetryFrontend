import { Avatar, Box, Flex, IconButton, Link, Text } from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { type PoemCommentType } from '@features/interactions';
import { formatRelativeTime } from '@root/core/base';
import { NavLink } from 'react-router-dom';

interface CommentThreadHeaderProps {
	comment: PoemCommentType;
	parentAuthorId?: number;
	parentAuthorNickname?: string;
	authClientId: number;
	isDeletingComment: boolean;
	onDelete: () => Promise<void>;
}

export function CommentThreadHeader({
	comment,
	parentAuthorId,
	parentAuthorNickname,
	authClientId,
	isDeletingComment,
	onDelete,
}: CommentThreadHeaderProps) {
	return (
		<Flex
			align='start'
			gap={3}
			w='full'
			position='relative'
			pr={comment.author.id === authClientId ? 8 : 0}
		>
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
			{comment.author.id === authClientId && (
				<IconButton
					position='absolute'
					top='0'
					right='0'
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
		</Flex>
	);
}

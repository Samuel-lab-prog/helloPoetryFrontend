import { Avatar, Box, Flex, IconButton, Link, Text } from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { type PoemCommentType } from '@features/interactions';
import { formatRelativeTime } from '@root/core/base';
import { NavLink } from 'react-router-dom';

interface CommentThreadHeaderProps {
	comment: PoemCommentType;
	authClientId: number;
	isDeletingComment: boolean;
	onDelete: () => Promise<void>;
}

export function CommentThreadHeader({
	comment,
	authClientId,
	isDeletingComment,
	onDelete,
}: CommentThreadHeaderProps) {
	return (
		<Flex justify='space-between' align='start' gap={3}>
			<Box flex='1'>
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
							<NavLink to={`/authors/${comment.author.id}`}>
								@{comment.author.nickname}
							</NavLink>
						</Link>
						<Text textStyle='smaller' color='pink.200'>
							{formatRelativeTime(comment.createdAt)}
						</Text>
					</Box>
				</Flex>
				<Text textStyle='small'>{comment.content}</Text>
			</Box>
			{comment.author.id === authClientId && (
				<IconButton
					size='xs'
					variant='solidPink'
					colorPalette='gray'
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

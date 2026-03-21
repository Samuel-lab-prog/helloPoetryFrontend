import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronDown, ChevronUp, Heart, MessageCircleReply } from 'lucide-react';
import { type PoemCommentType } from '@features/interactions';

interface CommentThreadActionsProps {
	comment: PoemCommentType;
	activeReplyFor: number | null;
	isAuthenticated: boolean;
	isUpdatingCommentLike: boolean;
	hasReplies: boolean;
	hasLoadedReplies: boolean;
	onToggleReplies: () => Promise<void>;
	onToggleLike: () => Promise<void> | void;
}

export function CommentThreadActions({
	comment,
	activeReplyFor,
	isAuthenticated,
	isUpdatingCommentLike,
	hasReplies,
	hasLoadedReplies,
	onToggleReplies,
	onToggleLike,
}: CommentThreadActionsProps) {
	return (
		<Flex mt={3} justify='space-between' align='center' gap={2} wrap='wrap'>
			<Flex align='center' gap={2}>
				<IconButton
					size='xs'
					variant='solidPink'
					colorPalette='gray'
					aria-label={activeReplyFor === comment.id ? 'Close reply' : 'Reply to comment'}
					title={activeReplyFor === comment.id ? 'Close reply' : 'Reply to comment'}
					disabled={!isAuthenticated}
					onClick={onToggleReplies}
				>
					<MessageCircleReply />
				</IconButton>
				<IconButton
					size='xs'
					variant='solidPink'
					colorPalette='gray'
					aria-label={comment.likedByCurrentUser ? 'Unlike comment' : 'Like comment'}
					title={comment.likedByCurrentUser ? 'Unlike comment' : 'Like comment'}
					disabled={!isAuthenticated}
					loading={isUpdatingCommentLike}
					onClick={onToggleLike}
				>
					<Heart />
				</IconButton>
				<Text textStyle='smaller' color='pink.200'>
					{comment.likesCount}
				</Text>
			</Flex>
			{hasReplies && (
				<Flex align='center' gap={2}>
					<Text textStyle='smaller' color='pink.200'>
						{comment.aggregateChildrenCount} repl
						{comment.aggregateChildrenCount === 1 ? 'y' : 'ies'}
					</Text>
					{!hasLoadedReplies && (
						<IconButton
							size='xs'
							variant='solidPink'
							colorPalette='gray'
							aria-label='View replies'
							title='View replies'
							onClick={onToggleReplies}
						>
							{activeReplyFor === comment.id ? <ChevronUp /> : <ChevronDown />}
						</IconButton>
					)}
				</Flex>
			)}
		</Flex>
	);
}

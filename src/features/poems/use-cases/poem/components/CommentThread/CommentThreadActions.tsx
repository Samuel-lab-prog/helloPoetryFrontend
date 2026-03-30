import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronDown, ChevronUp, Heart, MessageCircleReply } from 'lucide-react';
import { type PoemCommentType } from '@features/interactions';

interface CommentThreadActionsProps {
	comment: PoemCommentType;
	isReplyComposerOpen: boolean;
	areRepliesOpen: boolean;
	isAuthenticated: boolean;
	isUpdatingCommentLike: boolean;
	hasReplies: boolean;
	hasLoadedReplies: boolean;
	onToggleReplies: () => Promise<void>;
	onToggleReplyComposer: () => void;
	onToggleLike: () => Promise<void> | void;
}

export function CommentThreadActions({
	comment,
	isReplyComposerOpen,
	areRepliesOpen,
	isAuthenticated,
	isUpdatingCommentLike,
	hasReplies,
	hasLoadedReplies,
	onToggleReplies,
	onToggleReplyComposer,
	onToggleLike,
}: CommentThreadActionsProps) {
	return (
		<Flex mt={3} justify='space-between' align='center' gap={2} wrap='wrap'>
			<Flex align='center' gap={2}>
				<IconButton
					size='xs'
					variant='solidPink'
					colorPalette='gray'
					aria-label={isReplyComposerOpen ? 'Close reply' : 'Reply to comment'}
					title={isReplyComposerOpen ? 'Close reply' : 'Reply to comment'}
					disabled={!isAuthenticated}
					onClick={onToggleReplyComposer}
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
					<IconButton
						size='xs'
						variant='solidPink'
						colorPalette='gray'
						aria-label={areRepliesOpen ? 'Hide replies' : 'View replies'}
						title={areRepliesOpen ? 'Hide replies' : 'View replies'}
						onClick={onToggleReplies}
					>
						{areRepliesOpen ? <ChevronUp /> : <ChevronDown />}
					</IconButton>
					<Text textStyle='smaller' color='pink.200'>
						{areRepliesOpen ? 'Hide' : 'View'} {comment.aggregateChildrenCount} repl
						{comment.aggregateChildrenCount === 1 ? 'y' : 'ies'}
					</Text>
					{!hasLoadedReplies && areRepliesOpen && (
						<Text textStyle='smaller' color='pink.300'>
							Loading...
						</Text>
					)}
				</Flex>
			)}
		</Flex>
	);
}

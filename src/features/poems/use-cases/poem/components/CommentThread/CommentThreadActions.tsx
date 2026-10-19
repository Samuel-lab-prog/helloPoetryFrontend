import { Flex, IconButton, Text } from '@chakra-ui/react';
import { type PoemCommentType } from '@features/interactions/public';
import { ChevronDown, ChevronUp, Heart } from 'lucide-react';

interface CommentThreadActionsProps {
	comment: PoemCommentType;
	areRepliesOpen: boolean;
	hasReplies: boolean;
	hasLoadedReplies: boolean;
	isLoadingReplies: boolean;
	onToggleReplies: () => Promise<void>;
	onPrefetchReplies?: () => void;
	isAuthenticated: boolean;
	isLikePending: boolean;
	canLike: boolean;
	onToggleLike: () => Promise<void>;
}

export function CommentThreadActions({
	comment,
	areRepliesOpen,
	hasReplies,
	hasLoadedReplies,
	isLoadingReplies,
	onToggleReplies,
	onPrefetchReplies,
	isAuthenticated,
	isLikePending,
	canLike,
	onToggleLike,
}: CommentThreadActionsProps) {
	return (
		<Flex mt={2} justify='space-between' align='center' gap={2} wrap='wrap'>
			{hasReplies && (
				<Flex align='center' gap={2}>
					<IconButton
						size={{ base: '2xs', md: 'xs' }}
						variant='ghost'
						colorPalette='gray'
						aria-label={areRepliesOpen ? 'Hide replies' : 'View replies'}
						title={areRepliesOpen ? 'Hide replies' : 'View replies'}
						onClick={onToggleReplies}
						onMouseEnter={onPrefetchReplies}
					>
						{areRepliesOpen ? <ChevronUp /> : <ChevronDown />}
					</IconButton>
					<Text textStyle='smaller' color='pink.200'>
						{areRepliesOpen ? 'Hide' : 'View'} {comment.aggregateChildrenCount} repl
						{comment.aggregateChildrenCount === 1 ? 'y' : 'ies'}
					</Text>
					{isLoadingReplies && areRepliesOpen && !hasLoadedReplies && (
						<Text textStyle='smaller' color='pink.300'>
							Loading...
						</Text>
					)}
				</Flex>
			)}
			<Flex align='center' gap={1}>
				<IconButton
					size={{ base: '2xs', md: 'xs' }}
					variant='ghost'
					colorPalette={comment.likedByCurrentUser ? 'pink' : 'gray'}
					aria-label={comment.likedByCurrentUser ? 'Unlike comment' : 'Like comment'}
					aria-pressed={comment.likedByCurrentUser}
					title={comment.likedByCurrentUser ? 'Unlike comment' : 'Like comment'}
					disabled={!isAuthenticated || !canLike || isLikePending}
					loading={isLikePending}
					onClick={() => void onToggleLike()}
				>
					<Heart fill={comment.likedByCurrentUser ? 'currentColor' : 'none'} />
				</IconButton>
				<Text
					textStyle='smaller'
					color={comment.likedByCurrentUser ? 'pink.200' : 'fg.muted'}
					aria-label={`${comment.likesCount} ${comment.likesCount === 1 ? 'like' : 'likes'}`}
				>
					{comment.likesCount}
				</Text>
			</Flex>
		</Flex>
	);
}

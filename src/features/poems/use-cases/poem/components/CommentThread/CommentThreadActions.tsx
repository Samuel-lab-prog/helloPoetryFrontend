import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronDown, ChevronUp, MessageCircleReply } from 'lucide-react';
import { type PoemCommentType } from '@features/interactions';

interface CommentThreadActionsProps {
	comment: PoemCommentType;
	isReplyComposerOpen: boolean;
	areRepliesOpen: boolean;
	isAuthenticated: boolean;
	hasReplies: boolean;
	hasLoadedReplies: boolean;
	onToggleReplies: () => Promise<void>;
	onToggleReplyComposer: () => void;
	onPrefetchReplies?: () => void;
}

export function CommentThreadActions({
	comment,
	isReplyComposerOpen,
	areRepliesOpen,
	isAuthenticated,
	hasReplies,
	hasLoadedReplies,
	onToggleReplies,
	onToggleReplyComposer,
	onPrefetchReplies,
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
					{!hasLoadedReplies && areRepliesOpen && (
						<Text textStyle='smaller' color='pink.300'>
							Loading...
						</Text>
					)}
				</Flex>
			)}
			<Flex align='center' gap={2} ml='auto'>
				<IconButton
					size={{ base: '2xs', md: 'xs' }}
					variant='ghost'
					colorPalette='pink'
					aria-label={isReplyComposerOpen ? 'Close reply' : 'Reply to comment'}
					title={isReplyComposerOpen ? 'Close reply' : 'Reply to comment'}
					disabled={!isAuthenticated}
					onClick={onToggleReplyComposer}
				>
					<MessageCircleReply />
				</IconButton>
				{/* TODO: Re-enable comment likes once backend returns like state consistently. */}
			</Flex>
		</Flex>
	);
}

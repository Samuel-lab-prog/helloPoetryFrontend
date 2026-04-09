import { Flex, IconButton, Text } from '@chakra-ui/react';
import { type PoemCommentType } from '@features/interactions/public';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CommentThreadActionsProps {
	comment: PoemCommentType;
	areRepliesOpen: boolean;
	hasReplies: boolean;
	hasLoadedReplies: boolean;
	onToggleReplies: () => Promise<void>;
	onPrefetchReplies?: () => void;
}

export function CommentThreadActions({
	comment,
	areRepliesOpen,
	hasReplies,
	hasLoadedReplies,
	onToggleReplies,
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
			{/* TODO: Re-enable comment likes once backend returns like state consistently. */}
		</Flex>
	);
}

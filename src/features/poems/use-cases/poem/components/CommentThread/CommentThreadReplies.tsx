import { Box, Flex } from '@chakra-ui/react';
import { type PoemCommentType } from '@features/interactions';
import { type ReactNode } from 'react';

interface CommentThreadRepliesProps {
	replies: PoemCommentType[];
	renderReply: (reply: PoemCommentType) => ReactNode;
}

export function CommentThreadReplies({ replies, renderReply }: CommentThreadRepliesProps) {
	return (
		<Box mt={3} pl={4} borderLeft='1px solid' borderColor='purple.700'>
			<Flex direction='column' gap={2}>
				{replies.map((reply) => renderReply(reply))}
			</Flex>
		</Box>
	);
}

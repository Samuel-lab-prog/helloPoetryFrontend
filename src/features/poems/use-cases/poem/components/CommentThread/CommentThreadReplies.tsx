import { Box, Flex } from '@chakra-ui/react';
import { type PoemCommentType } from '@root/features/interactions/public';
import { type ReactNode } from 'react';

interface CommentThreadRepliesProps {
	replies: PoemCommentType[];
	renderReply: (reply: PoemCommentType, index: number) => ReactNode;
}

export function CommentThreadReplies({ replies, renderReply }: CommentThreadRepliesProps) {
	return (
		<Box mt={3}>
			<Box borderLeft='1px solid' borderColor='purple.700' pl={4}>
				<Flex direction='column' gap={2} w='full'>
					{replies.map((reply, index) => (
						<Box key={reply.id} pb={2} _last={{ pb: 0 }} w='full'>
							<Box p={2} borderRadius='md' bg='rgba(255,255,255,0.02)' w='full'>
								{renderReply(reply, index)}
							</Box>
						</Box>
					))}
				</Flex>
			</Box>
		</Box>
	);
}

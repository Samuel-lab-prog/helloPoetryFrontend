import { Box, Flex } from '@chakra-ui/react';
import { type PoemCommentType } from '@features/interactions';
import { type ReactNode } from 'react';

interface CommentThreadRepliesProps {
	replies: PoemCommentType[];
	renderReply: (reply: PoemCommentType) => ReactNode;
}

export function CommentThreadReplies({ replies, renderReply }: CommentThreadRepliesProps) {
	return (
		<Box mt={3}>
			<Box position='relative' pl={6}>
				<Box position='absolute' left='8px' top={0} bottom={0} w='1px' bg='purple.700' />
				<Flex direction='column' gap={2}>
					{replies.map((reply) => (
						<Box key={reply.id} position='relative'>
							<Box
								position='absolute'
								left='-20px'
								top='50%'
								transform='translateY(-50%)'
								h='2px'
								w='20px'
								bg='pink.300'
								borderRadius='full'
							/>
							<Box
								position='absolute'
								left='-21px'
								top='50%'
								transform='translateY(-50%)'
								boxSize='6px'
								borderRadius='full'
								bg='pink.300'
							/>
							<Box p={2} borderRadius='md' bg='rgba(255,255,255,0.03)'>
								{renderReply(reply)}
							</Box>
						</Box>
					))}
				</Flex>
			</Box>
		</Box>
	);
}

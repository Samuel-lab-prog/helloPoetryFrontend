import { Box, Flex, IconButton, Text, Textarea } from '@chakra-ui/react';
import { SendHorizontal } from 'lucide-react';

interface CommentThreadReplyComposerProps {
	replyInput: string;
	replyError: string;
	isAuthenticated: boolean;
	poemIsCommentable: boolean;
	isCreatingComment: boolean;
	onChange: (value: string) => void;
	onSubmit: () => Promise<void>;
}

export function CommentThreadReplyComposer({
	replyInput,
	replyError,
	isAuthenticated,
	poemIsCommentable,
	isCreatingComment,
	onChange,
	onSubmit,
}: CommentThreadReplyComposerProps) {
	return (
		<Box mt={3} pl={4} borderLeft='1px solid' borderColor='purple.700'>
			<Flex direction='column' gap={2}>
				<Textarea
					value={replyInput}
					onChange={(e) => onChange(e.target.value)}
					placeholder='Reply to comment'
					rows={3}
					maxLength={300}
					disabled={!isAuthenticated || !poemIsCommentable || isCreatingComment}
				/>
				<Flex justify='flex-end'>
					<IconButton
						size='sm'
						variant='solidPink'
						aria-label='Send reply'
						title='Send reply'
						disabled={
							!isAuthenticated || !replyInput.trim() || !poemIsCommentable || isCreatingComment
						}
						loading={isCreatingComment}
						onClick={onSubmit}
					>
						<SendHorizontal />
					</IconButton>
				</Flex>
				{replyError && (
					<Text textStyle='smaller' color='red.400'>
						{replyError}
					</Text>
				)}
			</Flex>
		</Box>
	);
}

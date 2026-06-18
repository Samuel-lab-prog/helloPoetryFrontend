import { Badge, Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { Tag } from '@features/poems/public/components/PoemTag';
import { NavLink } from 'react-router-dom';

type PoemHeaderProps = {
	poem: {
		title: string;
		excerpt: string | null;
		tags: { id: number; name: string }[];
		moderationStatus?: 'rejected' | 'removed' | 'approved' | 'pending';
		rejectionReason?: string | null;
	};
	editHref?: string;
	showEditPrompt?: boolean;
};

export function PoemHeader({ poem, editHref, showEditPrompt = false }: PoemHeaderProps) {
	const { title, excerpt, tags, moderationStatus, rejectionReason } = poem;
	const normalizedRejectionReason = rejectionReason?.trim();
	const shouldShowModerationNotice =
		moderationStatus === 'rejected' ||
		moderationStatus === 'pending' ||
		moderationStatus === 'removed';
	const isRejected = moderationStatus === 'rejected';
	const isRemoved = moderationStatus === 'removed';

	return (
		<>
			<Heading as='h1' textStyle={{ base: 'h3', md: 'h2' }} color='pink.100' mb={[2, 3]}>
				{title}
			</Heading>

			{excerpt && (
				<Text textStyle='small' my={[2, 3]}>
					{excerpt}
				</Text>
			)}

			<Flex gap={[1.5, 2]} flexWrap='wrap' mb={[3, 4]}>
				{tags.map((tag) => (
					<Tag key={tag.id}>{tag.name}</Tag>
				))}
			</Flex>

			{shouldShowModerationNotice && (
				<Box
					mt={4}
					p={4}
					border='1px solid'
					borderColor='red.500'
					borderRadius='xl'
					bg='rgba(255, 60, 100, 0.08)'
				>
					<Flex align='center' gap={2} mb={2} wrap='wrap'>
						<Badge colorPalette='red' variant='subtle'>
							{isRejected ? 'Rejected' : isRemoved ? 'Removed' : 'Pending'}
						</Badge>
						<Text textStyle='small' color='pink.100' fontWeight='semibold'>
							{isRejected ? 'Moderator reason' : isRemoved ? 'Poem removed' : 'Pending moderation'}
						</Text>
					</Flex>
					<Text textStyle='smaller' color='pink.100' whiteSpace='pre-wrap'>
						{isRejected
							? normalizedRejectionReason || 'No rejection reason was provided.'
							: isRemoved
								? 'This poem was removed by moderation. Interactions are disabled.'
							: 'This poem is waiting for moderation review. Interactions are disabled until it is approved.'}
					</Text>
					{isRejected && showEditPrompt && editHref && (
						<Flex
							mt={4}
							pt={4}
							borderTop='1px solid'
							borderColor='rgba(255, 255, 255, 0.12)'
							direction={{ base: 'column', md: 'row' }}
							align={{ base: 'start', md: 'center' }}
							justify='space-between'
							gap={3}
							>
								<Text textStyle='smaller' color='pink.100'>
									This poem was rejected. You can edit it and resubmit it for moderation.
								</Text>
								<Button asChild size='sm' variant='solidPink' colorPalette='gray' alignSelf='flex-end'>
									<NavLink to={editHref}>Edit poem</NavLink>
								</Button>
							</Flex>
					)}
				</Box>
			)}
		</>
	);
}

import { Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Tag } from '@features/poems/public/components/PoemTag';

type PoemHeaderProps = {
	poem: {
		title: string;
		excerpt: string | null;
		tags: { id: number; name: string }[];
		moderationStatus?: 'rejected' | 'removed' | 'approved' | 'pending';
		rejectionReason?: string | null;
	};
};

export function PoemHeader({ poem }: PoemHeaderProps) {
	const { title, excerpt, tags, moderationStatus, rejectionReason } = poem;
	const normalizedRejectionReason = rejectionReason?.trim();
	const shouldShowRejectionReason = moderationStatus === 'rejected';

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

			{shouldShowRejectionReason && (
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
							Rejected
						</Badge>
						<Text textStyle='small' color='pink.100' fontWeight='semibold'>
							Moderator reason
						</Text>
					</Flex>
					<Text textStyle='smaller' color='pink.100' whiteSpace='pre-wrap'>
						{normalizedRejectionReason || 'No rejection reason was provided.'}
					</Text>
				</Box>
			)}
		</>
	);
}

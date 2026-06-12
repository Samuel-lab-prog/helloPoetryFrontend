import { Badge, Box, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { Tag } from '@features/poems/public/components/PoemTag';
import { formatDate } from '@Utils';

type PoemHeaderProps = {
	poem: {
		title: string;
		excerpt: string | null;
		tags: { id: number; name: string }[];
		createdAt: string | Date;
		updatedAt: string | Date;
		moderationStatus?: 'rejected' | 'removed' | 'approved' | 'pending';
		rejectionReason?: string | null;
	};
};

export function PoemHeader({ poem }: PoemHeaderProps) {
	const { title, excerpt, tags, createdAt, updatedAt, moderationStatus, rejectionReason } = poem;
	const normalizedRejectionReason = rejectionReason?.trim();
	const shouldShowRejectionReason = moderationStatus === 'rejected';

	return (
		<>
			<Heading as='h1' textStyle={{ base: 'h4', md: 'h3' }} mb={[2, 3]}>
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

			<VStack align='start'>
				<Text fontStyle='italic' textStyle='smaller'>
					Created on {formatDate(createdAt)}
				</Text>

				{updatedAt !== createdAt && (
					<Text textStyle='smaller' fontStyle='italic'>
						Last updated on {formatDate(updatedAt)}
					</Text>
				)}
			</VStack>

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

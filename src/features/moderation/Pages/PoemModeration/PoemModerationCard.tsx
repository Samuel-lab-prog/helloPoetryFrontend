import { useState } from 'react';
import {
	Badge,
	Button,
	Heading,
	HStack,
	Link,
	Text,
	VStack,
	Wrap,
	WrapItem,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import {
	formatDate,
	MarkdownRenderer,
	Surface,
	translateModerationStatus,
	translateVisibility,
} from '@BaseComponents';
import type { ModeratePoemBody, ModerationPoem } from '@root/core/api/moderation/types';
import { Tag } from '@root/features/poems/use-cases/poem/components/PoemTag';
import { PoemAudioPlayer } from '@root/features/poems/use-cases/poem/components/PoemAudioPlayer';

export function ModerationPoemCard({
	poem,
	isPending,
	onModerate,
}: {
	poem: ModerationPoem;
	isPending: boolean;
	onModerate: (poemId: number, status: ModeratePoemBody['moderationStatus']) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const createdAt = formatDate(poem.createdAt);

	function getPreviewText(poem: ModerationPoem) {
		if (poem.excerpt && poem.excerpt.trim().length > 0) return poem.excerpt;
		const content = poem.content?.trim() ?? '';
		if (!content) return 'No content.';
		return content.length > 280 ? `${content.slice(0, 280)}...` : content;
	}
	return (
		<Surface variant='elevated'>
			<VStack align='stretch' gap={5}>
				<VStack align='start' gap={1}>
					<Badge colorPalette='purple' variant='outline'>
						Pending
					</Badge>
					<Heading as='h2' textStyle='h3'>
						{poem.title}
					</Heading>
					<Text textStyle='small' color='pink.100'>
						Author:{' '}
						<Link asChild color='pink.200' _hover={{ color: 'pink.50' }}>
							<NavLink to={`/authors/${poem.author.id}`}>
								{poem.author.name} (@{poem.author.nickname})
							</NavLink>
						</Link>
						{createdAt ? ` - ${createdAt}` : ''}
					</Text>
				</VStack>

				<Wrap spaceX={2}>
					<WrapItem>
						<Badge colorPalette='pink' variant='subtle'>
							{translateModerationStatus(poem.moderationStatus)}
						</Badge>
					</WrapItem>
					<WrapItem>
						<Badge colorPalette='pink' variant='subtle'>
							{translateVisibility(poem.visibility)}
						</Badge>
					</WrapItem>
					<WrapItem>
						<Badge colorPalette='pink' variant='subtle'>
							{poem.stats?.likesCount ?? 0} Likes
						</Badge>
					</WrapItem>
					<WrapItem>
						<Badge colorPalette='pink' variant='subtle'>
							{poem.stats?.commentsCount ?? 0} Comments
						</Badge>
					</WrapItem>
				</Wrap>

				{poem.tags?.length ? (
					<HStack gap={2} wrap='wrap'>
						{poem.tags.map((tag) => (
							<Tag key={tag.id}>{tag.name}</Tag>
						))}
					</HStack>
				) : null}

				<Surface variant='panel'>
					<VStack align='stretch' gap={3}>
						<Text textStyle='small' color='pink.200' textTransform='uppercase'>
							Summary
						</Text>
						<Text textStyle='body' color='pink.100'>
							{getPreviewText(poem)}
						</Text>
						<Button
							size='sm'
							variant='solidPink'
							colorPalette='gray'
							alignSelf='flex-start'
							width='auto'
							onClick={() => setExpanded((value) => !value)}
						>
							{expanded ? 'Hide full text' : 'Show full text'}
						</Button>
						{expanded ? (
							<Surface variant='soft'>
								<MarkdownRenderer content={poem.content} />
							</Surface>
						) : null}
					</VStack>
				</Surface>

				{poem.AudioUrl ? (
					<Surface variant='panel'>
						<VStack align='stretch' gap={3}>
							<Text textStyle='small' color='pink.200' textTransform='uppercase'>
								Audio
							</Text>
							<PoemAudioPlayer src={poem.AudioUrl} title='Poem Audio' />
						</VStack>
					</Surface>
				) : null}

				<HStack gap={3} flexWrap='wrap'>
					<Button
						variant='solidPink'
						size='sm'
						loading={isPending}
						onClick={() => onModerate(poem.id, 'approved')}
					>
						Approve
					</Button>
					<Button
						variant='solidPink'
						colorPalette='gray'
						size='sm'
						loading={isPending}
						onClick={() => onModerate(poem.id, 'rejected')}
					>
						Reject
					</Button>
				</HStack>
			</VStack>
		</Surface>
	);
}

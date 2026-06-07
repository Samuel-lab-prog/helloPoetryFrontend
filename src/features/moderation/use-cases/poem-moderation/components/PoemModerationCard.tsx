import type { ModeratePoemBody, ModerationPoem } from '@Api/moderation/types';
import { MarkdownRenderer, Surface } from '@BaseComponents';
import {
	Badge,
	Heading,
	HStack,
	IconButton,
	Flex,
	Link,
	Text,
	VStack,
	Wrap,
	WrapItem,
} from '@chakra-ui/react';
import { PoemAudioPlayer } from '@features/poems/public/components/PoemAudioPlayer';
import { Tag } from '@features/poems/public/components/PoemTag';
import { formatDate, translateModerationStatus, translateVisibility } from '@Utils';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export function ModerationPoemCard({
	poem,
	isPending,
	isRemoving = false,
	onModerate,
}: {
	poem: ModerationPoem;
	isPending: boolean;
	isRemoving?: boolean;
	onModerate: (poemId: number, status: ModeratePoemBody['moderationStatus']) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const createdAt = formatDate(poem.createdAt);

	function getPreviewText(poem: ModerationPoem) {
		if (poem.excerpt && poem.excerpt.trim().length > 0) return poem.excerpt;
		const content = poem.content?.trim() ?? '';
		if (!content) return 'No content.';
		return content.length > 180 ? `${content.slice(0, 180)}...` : content;
	}
	return (
		<Surface
			variant='elevated'
			overflow='hidden'
			maxH={isRemoving ? '0px' : '999px'}
			opacity={isRemoving ? 0 : 1}
			transform={isRemoving ? 'translateY(-6px)' : 'translateY(0)'}
			pointerEvents={isRemoving ? 'none' : 'auto'}
			transition='max-height 0.22s ease, opacity 0.18s ease, transform 0.22s ease'
			animationName='slide-from-bottom, fade-in'
			animationDuration='320ms'
			animationTimingFunction='ease-out'
			animationFillMode='backwards'
		>
			<VStack align='stretch' gap={4}>
				<VStack align='start' gap={1}>
					<Badge colorPalette='purple' variant='outline'>
						Pending
					</Badge>
					<Heading as='h2' textStyle='h4'>
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
				</Wrap>

				{poem.tags?.length ? (
					<HStack gap={2} wrap='wrap'>
						{poem.tags.map((tag) => (
							<Tag key={tag.id}>{tag.name}</Tag>
					))}
				</HStack>
				) : null}

				<VStack align='stretch' gap={2}>
					<Text textStyle='small' color='pink.200' textTransform='uppercase'>
						Summary
					</Text>
					<Text textStyle='small' color='pink.100'>
						{getPreviewText(poem)}
					</Text>
					<IconButton
						aria-label={expanded ? 'Hide full text' : 'Show full text'}
						size='sm'
						variant='outlinePurple'
						colorPalette='gray'
						alignSelf='flex-start'
						disabled={isRemoving}
						onClick={() => setExpanded((value) => !value)}
					>
						{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
					</IconButton>
					{expanded ? (
						<VStack align='stretch' gap={2} pt={2} borderTop='1px solid' borderColor='purple.700'>
							<Text textStyle='small' color='pink.200' textTransform='uppercase'>
								Full text
							</Text>
							<MarkdownRenderer content={poem.content} />
						</VStack>
					) : null}
				</VStack>

				{poem.audioUrl ? (
					<VStack align='stretch' gap={2} pt={2} borderTop='1px solid' borderColor='purple.700'>
						<Text textStyle='small' color='pink.200' textTransform='uppercase'>
							Audio
						</Text>
						<PoemAudioPlayer src={poem.audioUrl} title='Poem Audio' />
					</VStack>
				) : null}

				<Flex justify='flex-end' w='full'>
					<HStack gap={2} flexWrap='wrap' justify='flex-end'>
						<IconButton
							aria-label='Approve poem'
							variant='solid'
							size='sm'
							bg='green.500'
							color='white'
							borderColor='green.600'
							loading={isPending}
							disabled={isRemoving}
							onClick={() => onModerate(poem.id, 'approved')}
							_hover={{ bg: 'green.400' }}
							_active={{ bg: 'green.600' }}
						>
							<Check size={16} />
						</IconButton>
						<IconButton
							aria-label='Reject poem'
							variant='solid'
							size='sm'
							bg='red.500'
							color='white'
							borderColor='red.600'
							loading={isPending}
							disabled={isRemoving}
							onClick={() => onModerate(poem.id, 'rejected')}
							_hover={{ bg: 'red.400' }}
							_active={{ bg: 'red.600' }}
						>
							<X size={16} />
						</IconButton>
					</HStack>
				</Flex>
			</VStack>
		</Surface>
	);
}

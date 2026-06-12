import type { ModeratePoemBody, ModerationPoem } from '@Api/moderation/types';
import { MarkdownRenderer, Surface } from '@BaseComponents';
import {
	Badge,
	Box,
	Button,
	Flex,
	Heading,
	HStack,
	IconButton,
	Link,
	Text,
	Textarea,
	VStack,
	Wrap,
	WrapItem,
} from '@chakra-ui/react';
import { PoemAudioPlayer } from '@features/poems/public/components/PoemAudioPlayer';
import { Tag } from '@features/poems/public/components/PoemTag';
import { formatDate, translateModerationStatus, translateVisibility } from '@Utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
	onModerate: (
		poemId: number,
		status: ModeratePoemBody['moderationStatus'],
		reason?: string,
	) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [showRejectForm, setShowRejectForm] = useState(false);
	const [rejectionReason, setRejectionReason] = useState('');
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
			maxH={isRemoving ? '0px' : 'none'}
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
					<Heading as='h2' textStyle='h4'>
						{poem.title}
					</Heading>
					<Text textStyle='small' color='pink.100'>
						<Link asChild color='pink.200' _hover={{ color: 'pink.50' }}>
							<NavLink to={`/authors/${poem.author.id}`}>
								{poem.author.name} (@{poem.author.nickname})
							</NavLink>
						</Link>
					</Text>
					<Text textStyle='smaller' color='pink.200' fontStyle='italic'>
						Created on {createdAt}
					</Text>
				</VStack>

				<Wrap spaceX={0}>
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
					<HStack gap={1} wrap='wrap'>
						{poem.tags.map((tag) => (
							<Tag key={tag.id}>{tag.name}</Tag>
						))}
					</HStack>
				) : null}

				<VStack align='stretch' gap={2}>
					<Text textStyle='label' color='pink.200'>
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
						<VStack
							align='stretch'
							gap={2}
							pt={2}
							borderTop='1px solid'
							borderColor='purple.700'
							w='full'
						>
							<Text textStyle='label' color='pink.200'>
								Full text
							</Text>
							<Box w='full' whiteSpace='pre-wrap' wordBreak='break-word'>
								<MarkdownRenderer content={poem.content} />
							</Box>
						</VStack>
					) : null}
					{showRejectForm ? (
						<VStack
							align='stretch'
							gap={3}
							pt={4}
							mt={2}
							borderTop='1px solid'
							borderColor='purple.700'
						>
							<Text textStyle='label' color='pink.200'>
								Confirm rejection
							</Text>
							<Text textStyle='smaller' color='pink.100'>
								This action will reject the poem after you provide a reason.
							</Text>
							<Text textStyle='label' color='pink.200'>
								Rejection reason
							</Text>
							<Textarea
								value={rejectionReason}
								onChange={(event) => setRejectionReason(event.target.value)}
								placeholder='Explain why this poem is being rejected'
								textStyle='small'
								bg='rgba(255, 255, 255, 0.03)'
								borderColor='border'
								_hover={{ borderColor: 'borderHover' }}
								_focusVisible={{
									borderColor: 'pink.300',
									boxShadow: '0 0 0 5px rgba(255, 143, 189, 0.25)',
								}}
								minH='96px'
							/>
							<Text textStyle='smaller' color='pink.300'>
								At least 10 characters.
							</Text>
							<HStack gap={2} flexWrap='wrap' pt={1}>
								<Button
									size='sm'
									variant='outlinePurple'
									colorPalette='gray'
									disabled={isPending}
									onClick={() => {
										setShowRejectForm(false);
										setRejectionReason('');
									}}
								>
									Cancel
								</Button>
								<Button
									size='sm'
									variant='solid'
									bg='red.500'
									color='white'
									borderColor='red.600'
									loading={isPending}
									disabled={isRemoving || rejectionReason.trim().length < 10}
									onClick={() => {
										onModerate(poem.id, 'rejected', rejectionReason.trim());
										setShowRejectForm(false);
										setRejectionReason('');
									}}
									_hover={{ bg: 'red.400' }}
									_active={{ bg: 'red.600' }}
								>
									Confirm rejection
								</Button>
							</HStack>
						</VStack>
					) : null}
				</VStack>

				{poem.audioUrl ? (
					<VStack align='stretch' gap={2} pt={2} borderTop='1px solid' borderColor='purple.700'>
						<Text textStyle='label' color='pink.200'>
							Audio
						</Text>
						<PoemAudioPlayer src={poem.audioUrl} title='Poem Audio' />
					</VStack>
				) : null}

				<Flex justify='flex-end' w='full'>
					<HStack gap={2} flexWrap='wrap' justify='flex-end'>
						{showRejectForm ? (
							<Button
								size='sm'
								variant='outlinePurple'
								colorPalette='gray'
								disabled={isRemoving}
								onClick={() => setShowRejectForm(false)}
							>
								Back to actions
							</Button>
						) : (
							<>
								<Button
									size='sm'
									variant='solid'
									bg='green.500'
									color='white'
									borderColor='green.600'
									loading={isPending}
									disabled={isRemoving}
									onClick={() => onModerate(poem.id, 'approved')}
									_hover={{ bg: 'green.400' }}
									_active={{ bg: 'green.600' }}
								>
									Approve
								</Button>
								<Button
									size='sm'
									variant='solid'
									bg='red.500'
									color='white'
									borderColor='red.600'
									loading={isPending}
									disabled={isRemoving}
									onClick={() => setShowRejectForm(true)}
									_hover={{ bg: 'red.400' }}
									_active={{ bg: 'red.600' }}
								>
									Reject
								</Button>
							</>
						)}
					</HStack>
				</Flex>
			</VStack>
		</Surface>
	);
}

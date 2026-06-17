import {
	Avatar,
	Badge,
	Box,
	Card,
	Flex,
	Icon,
	Link,
	LinkBox,
	LinkOverlay,
	Text,
} from '@chakra-ui/react';
import { ModerationActionsMenu } from '@features/moderation/public';
import { formatRelativeTime } from '@Utils';
import { Heart, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import type { PoemPreviewType, TagType } from '../types';

type PoemCardProps = {
	poem: PoemPreviewType;
	hideAuthorMeta?: boolean;
	variant?: 'card' | 'flat';
};

export function PoemCard({ poem, hideAuthorMeta = false, variant = 'card' }: PoemCardProps) {
	const relativeCreatedAt = formatRelativeTime(poem.createdAt);
	const likesCount = poem.stats?.likesCount ?? poem.likesCount;
	const commentsCount = poem.stats?.commentsCount ?? poem.commentsCount;
	const moderationPoemTarget = {
		id: poem.id,
		title: poem.title,
		status: poem.status,
		moderationStatus: poem.moderationStatus,
		author: {
			id: poem.author.id,
			name: poem.author.name,
			nickname: poem.author.nickname,
			avatarUrl: poem.author.avatarUrl,
		},
	};

	if (variant === 'flat') {
		return (
			<LinkBox
				py={{ base: 3, md: 4 }}
				px={{ base: 3.5, md: 4 }}
				borderRadius='lg'
				transition='background-color 0.22s ease'
				_hover={{ bg: 'rgba(255, 255, 255, 0.04)' }}
			>
				<Flex direction='column' gap={{ base: 2.5, md: 3 }}>
					<Flex align='start' justify='space-between' gap={2}>
						<LinkOverlay asChild>
							<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
								<Flex direction='column' gap={1}>
									<Text textStyle='h4' mb={0}>
										{poem.title}
									</Text>
									{poem.excerpt && (
										<Text textStyle='smaller' color='pink.100' opacity={0.9} lineClamp={3} mb={0}>
											{poem.excerpt}
										</Text>
									)}
								</Flex>
							</NavLink>
						</LinkOverlay>
						<ModerationActionsMenu
							poem={moderationPoemTarget}
							size='xs'
							variant='ghost'
							ariaLabel='Open poem moderation actions'
						/>
					</Flex>

					{!hideAuthorMeta && (
						<Link asChild display='inline-flex' w='fit-content' alignSelf='start'>
							<NavLink to={`/authors/${poem.author.id}`}>
								<Flex
									align='center'
									alignSelf='start'
									gap={2}
									pr={2}
									py={1.5}
									w='fit-content'
									display='inline-flex'
									borderRadius='md'
									transition='background-color 0.2s ease'
									_hover={{ bg: 'rgba(255, 255, 255, 0.04)' }}
								>
									<Avatar.Root size={{ base: 'xs', md: 'md' }}>
										<Avatar.Image src={poem.author.avatarUrl ?? undefined} />
										<Avatar.Fallback name={poem.author.nickname} />
									</Avatar.Root>
									<Flex direction='column' minW={0} gap={0}>
										<Text textStyle='small' color='pink.100' lineHeight='short' truncate>
											{poem.author.name}
										</Text>
										<Text textStyle='smaller' color='pink.200' opacity={0.9}>
											@{poem.author.nickname}
										</Text>
									</Flex>
								</Flex>
							</NavLink>
						</Link>
					)}

					<Flex align='center' gap={{ base: 3, md: 4 }} wrap='wrap'>
						{typeof likesCount === 'number' && (
							<Flex align='center' gap={2} color='pink.200'>
								<Icon as={Heart} boxSize={4} />
								<Text textStyle='smaller'>{likesCount}</Text>
							</Flex>
						)}
						{typeof commentsCount === 'number' && (
							<Flex align='center' gap={2} color='pink.200'>
								<Icon as={MessageCircle} boxSize={4} />
								<Text textStyle='smaller'>{commentsCount}</Text>
							</Flex>
						)}
						{relativeCreatedAt && (
							<Text textStyle='smaller' color='pink.300'>
								{relativeCreatedAt}
							</Text>
						)}
					</Flex>

					{poem.tags.length > 0 && (
						<Flex gap={2} wrap='wrap'>
							{poem.tags.slice(0, 4).map((tag: TagType) => (
								<Badge
									key={tag.id}
									size='sm'
									colorPalette='pink'
									variant='subtle'
									fontSize={{ base: '2xs', md: 'xs' }}
									px={{ base: 1.5, md: 2 }}
									py={{ base: 0.5, md: 1 }}
								>
									#{tag.name}
								</Badge>
							))}
						</Flex>
					)}
				</Flex>
			</LinkBox>
		);
	}

	return (
		<Card.Root
			as={LinkBox}
			p={{ base: 4, md: 6 }}
			h='full'
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			backdropFilter='blur(4px)'
			overflow='hidden'
			transition='background-color 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease, transform 0.2s ease'
			_hover={{
				borderColor: 'purple.500',
				bg: 'rgba(255, 255, 255, 0.04)',
				transform: 'translateY(-2px)',
				boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
			}}
			_focusWithin={{
				borderColor: 'pink.400',
				bg: 'rgba(255, 255, 255, 0.06)',
				boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
			}}
			animationName='fade-in'
			animationDuration='320ms'
			animationTimingFunction='ease-out'
		>
			<Box
				position='absolute'
				top='0'
				left='0'
				right='0'
				h='2px'
				bgGradient='linear(to-r, purple.500, pink.400)'
			/>

			<Card.Header p={0} mb={{ base: 2, md: 2 }} gap={1}>
				<Flex align='start' justify='space-between' gap={2}>
					<Badge size='sm' colorPalette='pink' w='fit-content' variant='subtle'>
						Poem
					</Badge>
					<ModerationActionsMenu
						poem={moderationPoemTarget}
						size='xs'
						variant='ghost'
						ariaLabel='Open poem moderation actions'
					/>
				</Flex>
				<LinkOverlay asChild>
					<NavLink to={`/poems/${poem.slug}/${poem.id}`}>
						<Flex direction='column' gap={1}>
							<Card.Title as='h4' textStyle='h4' mb={0}>
								{poem.title}
							</Card.Title>
							{poem.excerpt && (
								<Text textStyle='smaller' color='pink.100' opacity={0.9} lineClamp={3} mb={0}>
									{poem.excerpt}
								</Text>
							)}
						</Flex>
					</NavLink>
				</LinkOverlay>
			</Card.Header>

			<Card.Body p={0} flex='1'>
				<Flex direction='column' gap={{ base: 2.5, md: 3 }}>
					{!hideAuthorMeta && (
						<Link asChild display='inline-flex' w='fit-content' alignSelf='start'>
							<NavLink to={`/authors/${poem.author.id}`}>
								<Flex
									align='center'
									alignSelf='start'
									gap={2}
									px={2}
									py={1.5}
									w='fit-content'
									display='inline-flex'
									borderRadius='md'
									transition='background-color 0.2s ease'
									_hover={{ bg: 'rgba(255, 255, 255, 0.04)' }}
								>
									<Avatar.Root size={{ base: 'xs', md: 'md' }}>
										<Avatar.Image src={poem.author.avatarUrl ?? undefined} />
										<Avatar.Fallback name={poem.author.nickname} />
									</Avatar.Root>
									<Flex direction='column' minW={0} gap={0}>
										<Text textStyle='small' color='pink.100' lineHeight='short' truncate>
											{poem.author.name}
										</Text>
										<Text textStyle='smaller' color='pink.200' opacity={0.9}>
											@{poem.author.nickname}
										</Text>
									</Flex>
								</Flex>
							</NavLink>
						</Link>
					)}

					<Flex align='center' gap={{ base: 3, md: 4 }} wrap='wrap'>
						{typeof likesCount === 'number' && (
							<Flex align='center' gap={2} color='pink.200'>
								<Icon as={Heart} boxSize={4} />
								<Text textStyle='smaller'>{likesCount}</Text>
							</Flex>
						)}
						{typeof commentsCount === 'number' && (
							<Flex align='center' gap={2} color='pink.200'>
								<Icon as={MessageCircle} boxSize={4} />
								<Text textStyle='smaller'>{commentsCount}</Text>
							</Flex>
						)}
						{relativeCreatedAt && (
							<Text textStyle='smaller' color='pink.300'>
								{relativeCreatedAt}
							</Text>
						)}
					</Flex>

					{poem.tags.length > 0 && (
						<Flex gap={2} wrap='wrap'>
							{poem.tags.slice(0, 4).map((tag: TagType) => (
								<Badge
									key={tag.id}
									size='sm'
									colorPalette='pink'
									variant='subtle'
									fontSize={['2xs', 'xs']}
									px={{ base: 1.5, md: 2 }}
									py={{ base: 0.5, md: 1 }}
								>
									#{tag.name}
								</Badge>
							))}
						</Flex>
					)}
				</Flex>
			</Card.Body>
		</Card.Root>
	);
}

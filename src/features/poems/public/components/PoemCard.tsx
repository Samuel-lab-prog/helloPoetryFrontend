import { formatRelativeTime } from '@BaseComponents';
import { Avatar, Badge, Box, Card, Flex, Icon, Link, Text } from '@chakra-ui/react';
import { Heart, MessageCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import type { PoemPreviewType, TagType } from '../types';

type PoemCardProps = {
	poem: PoemPreviewType;
	hideAuthorMeta?: boolean;
};

export function PoemCard({ poem, hideAuthorMeta = false }: PoemCardProps) {
	const relativeCreatedAt = formatRelativeTime(poem.createdAt);
	const likesCount = poem.stats?.likesCount ?? poem.likesCount;
	const commentsCount = poem.stats?.commentsCount ?? poem.commentsCount;

	return (
		<Card.Root
			p={6}
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

			<Card.Header p={0} mb={5} gap={1}>
				<Badge size='sm' colorPalette='pink' w='fit-content' variant='subtle'>
					Poem
				</Badge>
				<Card.Title as='h3' textStyle='h3'>
					{poem.title}
				</Card.Title>
				{poem.excerpt && (
					<Text textStyle='smaller' color='pink.100' opacity={0.9} lineClamp={3}>
						{poem.excerpt}
					</Text>
				)}
			</Card.Header>

			<Card.Body p={0} flex='1'>
				<Flex direction='column' gap={3}>
					{!hideAuthorMeta && (
						<Flex align='center' gap={2}>
							<Avatar.Root size='md'>
								<Avatar.Image src={poem.author.avatarUrl ?? undefined} />
								<Avatar.Fallback name={poem.author.nickname} />
							</Avatar.Root>
							<Flex direction='column' minW={0} gap={0}>
								<Text textStyle='small' color='pink.100' lineHeight='short' truncate>
									{poem.author.name}
								</Text>
								<Link asChild textStyle='smaller' color='pink.200' opacity={0.9}>
									<NavLink to={`/authors/${poem.author.id}`}>@{poem.author.nickname}</NavLink>
								</Link>
							</Flex>
						</Flex>
					)}

					<Flex align='center' gap={4} wrap='wrap'>
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
								<Badge key={tag.id} size='sm' colorPalette='pink' variant='subtle'>
									#{tag.name}
								</Badge>
							))}
						</Flex>
					)}
				</Flex>
			</Card.Body>

			<Card.Footer p={0} justifyContent='flex-end' mt={6}>
				<Link
					asChild
					textStyle='small'
					px={3}
					py={2}
					borderRadius='md'
					color='pink.100'
					border='1px solid'
					borderColor='purple.500'
					transition='all 0.2s ease'
					_hover={{
						color: 'pink.50',
						borderColor: 'pink.400',
						bg: 'rgba(255, 255, 255, 0.06)',
					}}
				>
					<NavLink to={`/poems/${poem.slug}/${poem.id}`}>Read poem</NavLink>
				</Link>
			</Card.Footer>
		</Card.Root>
	);
}

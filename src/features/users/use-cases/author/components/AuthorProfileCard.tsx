import { Avatar, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import type { AuthorProfileType } from '@features/poems/public/types';

import type { RelationStatus } from './utils';

type AuthorProfileCardProps = {
	author: AuthorProfileType;
	relationStatus: RelationStatus | null;
	action: {
		label: string | null;
		onClick?: () => void;
		isLoading?: boolean;
		disabled?: boolean;
		secondaryLabel?: string | null;
		secondaryOnClick?: () => void;
	} | null;
	errorMessage?: string | null;
};

export function AuthorProfileCard({
	author,
	relationStatus,
	action,
	errorMessage,
}: AuthorProfileCardProps) {
	return (
		<Flex
			p={{ base: 3.5, md: 5 }}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			backdropFilter='blur(4px)'
			gap={3}
			align='start'
			direction='column'
			animationName='slide-from-bottom, fade-in'
			animationDuration='320ms'
			animationTimingFunction='ease-out'
			animationFillMode='backwards'
			animationDelay='30ms'
		>
			<Flex align='start' gap={3} w='full'>
				<Avatar.Root
					size='lg'
					w={{ base: '4.75rem', md: '6rem' }}
					h={{ base: '4.75rem', md: '6rem' }}
				>
					<Avatar.Image src={author.avatarUrl ?? undefined} />
					<Avatar.Fallback name={author.name} />
				</Avatar.Root>

				<Flex direction='column' gap={0.75} minW={0} flex='1'>
					<Heading as='h1' textStyle={{ base: 'h4', md: 'h3' }}>
						{author.name}
					</Heading>
					<Text textStyle='smaller' color='pink.200'>
						@{author.nickname}
					</Text>
					<Text textStyle='smaller'>{author.bio || 'No bio'}</Text>
					<Text textStyle='smaller' color='pink.200'>
						Poems: {author.stats.poemsCount} | Comments: {author.stats.commentsCount} | Friends:{' '}
						{author.stats.friendsCount}
					</Text>
				</Flex>
			</Flex>

			<Flex direction='column' gap={1} align='start' w='full'>
				{relationStatus && (
					<Flex align='center' gap={2}>
						<Icon as={relationStatus.icon} boxSize={4} color={relationStatus.color} />
						<Text textStyle='smaller' color={relationStatus.color} truncate>
							{relationStatus.text}
						</Text>
					</Flex>
				)}

				{(action?.label || action?.secondaryLabel) && (
					<Flex w='full' minW={0} gap={2} direction={{ base: 'column', sm: 'row' }}>
						{action?.label ? (
							<Button
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								onClick={action.onClick}
								loading={action.isLoading}
								loadingText={action.label}
								justifyContent='center'
								w='full'
								flex='1'
								minW={0}
								disabled={action.disabled}
							>
								{action.label}
							</Button>
						) : null}
						{action?.secondaryLabel ? (
							<Button
								size={{ base: 'xs', md: 'sm' }}
								variant='danger'
								onClick={action.secondaryOnClick}
								justifyContent='center'
								w='full'
								flex='1'
								minW={0}
								disabled={action.disabled}
							>
								{action.secondaryLabel}
							</Button>
						) : null}
					</Flex>
				)}

				{errorMessage && (
					<Text textStyle='smaller' color='red.400'>
						{errorMessage}
					</Text>
				)}
			</Flex>
		</Flex>
	);
}

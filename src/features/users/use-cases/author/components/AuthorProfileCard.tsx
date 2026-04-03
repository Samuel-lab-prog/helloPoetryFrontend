import { Avatar, Box, Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
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
			p={6}
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			backdropFilter='blur(4px)'
			gap={6}
			align={{ base: 'start', md: 'center' }}
			direction={{ base: 'column', md: 'row' }}
			animationName='slide-from-bottom, fade-in'
			animationDuration='320ms'
			animationTimingFunction='ease-out'
			animationFillMode='backwards'
			animationDelay='30ms'
		>
			<Avatar.Root size='2xl' w={{ base: '6rem', md: '8rem' }} h={{ base: '6rem', md: '8rem' }}>
				<Avatar.Image src={author.avatarUrl ?? undefined} />
				<Avatar.Fallback name={author.name} />
			</Avatar.Root>

			<Flex direction='column' gap={1}>
				<Heading as='h1' textStyle='h2'>
					{author.name}
				</Heading>
				<Text textStyle='small' color='pink.200'>
					@{author.nickname}
				</Text>
				<Text textStyle='small'>{author.bio || 'No bio'}</Text>
				<Text textStyle='smaller' color='pink.200'>
					Poems: {author.stats.poemsCount} | Comments: {author.stats.commentsCount} | Friends:{' '}
					{author.stats.friendsCount}
				</Text>

				<Flex mt={2} direction='column' gap={2} align='start'>
					<Box minH='24px'>
						{relationStatus && (
							<Flex align='center' gap={2}>
								<Icon as={relationStatus.icon} boxSize={4.5} color={relationStatus.color} />
								<Text textStyle='smaller' color={relationStatus.color} truncate>
									{relationStatus.text}
								</Text>
							</Flex>
						)}
					</Box>

					<Flex minH='32px' w='full' minW={0} gap={2} direction={{ base: 'column', sm: 'row' }}>
						{action?.label ? (
							<Button
								size='sm'
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
								size='sm'
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

					{errorMessage && (
						<Text textStyle='smaller' color='red.400'>
							{errorMessage}
						</Text>
					)}
				</Flex>
			</Flex>
		</Flex>
	);
}

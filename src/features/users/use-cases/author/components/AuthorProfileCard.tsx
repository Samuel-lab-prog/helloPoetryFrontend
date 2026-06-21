import { Surface } from '@BaseComponents';
import { Avatar, Badge, Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import { ModerationActionsMenu } from '@features/moderation/public';
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
		<Surface
			variant='elevated'
			p={{ base: 4, md: 6 }}
			animationName='slide-from-bottom, fade-in'
			animationDuration='320ms'
			animationTimingFunction='ease-out'
			animationFillMode='backwards'
			animationDelay='30ms'
		>
			<Flex direction='column' gap={4}>
				<Flex align='start' justify='space-between' gap={4} w='full'>
					<Flex
						direction={{ base: 'column', md: 'row' }}
						align={{ base: 'start', md: 'start' }}
						gap={4}
						minW={0}
						flex='1'
					>
						<Box
							p='2px'
							borderRadius='full'
							bgGradient='linear(to-br, pink.400, purple.500)'
							boxShadow='0 0 0 1px rgba(255,255,255,0.04)'
						>
							<Avatar.Root
								size='lg'
								w={{ base: '5rem', md: '6.5rem' }}
								h={{ base: '5rem', md: '6.5rem' }}
								border='2px solid'
								borderColor='rgba(20, 0, 18, 0.85)'
							>
								<Avatar.Image src={author.avatarUrl ?? undefined} />
								<Avatar.Fallback name={author.name} />
							</Avatar.Root>
						</Box>

						<Flex direction='column' gap={2} minW={0} flex='1'>
							<Flex align='center' gap={2} wrap='wrap'>
								<Heading as='h1' textStyle={{ base: 'h4', md: 'h3' }} mb={0}>
									{author.name}
								</Heading>
								{relationStatus && (
									<Badge colorPalette='pink' variant='subtle'>
										{relationStatus.text}
									</Badge>
								)}
							</Flex>
							<Text textStyle='smaller' color='pink.200'>
								@{author.nickname}
							</Text>
							<Text textStyle='smaller' color='pink.100'>
								{author.bio || 'No bio yet.'}
							</Text>
						</Flex>
					</Flex>
					<ModerationActionsMenu
						user={{
							id: author.id,
							name: author.name,
							nickname: author.nickname,
							role: author.role,
							status: author.status,
							avatarUrl: author.avatarUrl,
						}}
						size={{ base: 'xs', md: 'sm' }}
						variant='ghost'
						ariaLabel='Open user moderation actions'
					/>
				</Flex>

				<Flex gap={2} wrap='wrap'>
					<Box
						px={3}
						py={1.5}
						borderRadius='full'
						bg='rgba(255,255,255,0.04)'
						border='1px solid'
						borderColor='purple.700'
					>
						<Text textStyle='smaller' color='pink.100'>
							{author.stats.poemsCount} poems
						</Text>
					</Box>
					<Box
						px={3}
						py={1.5}
						borderRadius='full'
						bg='rgba(255,255,255,0.04)'
						border='1px solid'
						borderColor='purple.700'
					>
						<Text textStyle='smaller' color='pink.100'>
							{author.stats.commentsCount} comments
						</Text>
					</Box>
					<Box
						px={3}
						py={1.5}
						borderRadius='full'
						bg='rgba(255,255,255,0.04)'
						border='1px solid'
						borderColor='purple.700'
					>
						<Text textStyle='smaller' color='pink.100'>
							{author.stats.friendsCount} friends
						</Text>
					</Box>
				</Flex>

				{(action?.label || action?.secondaryLabel) && (
					<Flex w='full' minW={0} gap={2} direction={{ base: 'column', sm: 'row' }}>
						{action?.label ? (
							<Button
								size={{ base: 'sm', md: 'sm' }}
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
								size={{ base: 'sm', md: 'sm' }}
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
		</Surface>
	);
}

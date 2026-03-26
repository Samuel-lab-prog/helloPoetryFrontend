import { Avatar, Flex, Heading, HStack, IconButton, Link, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Check, UserPlus, X } from 'lucide-react';
import { Surface } from '@root/core/base';
import type { FriendRequestsSectionProps } from './types';

export function FriendRequestsSection({
	friendRequests,
	viewAllHref,
	isFriendRequestsLoading,
	isFriendRequestsError,
	isAccepting,
	isRejecting,
	errorMessage,
	onAcceptRequest,
	onRejectRequest,
}: FriendRequestsSectionProps) {
	return (
		<Surface p={5} variant='panel'>
			<Flex
				align={{ base: 'start', md: 'center' }}
				justify='space-between'
				direction={{ base: 'column', md: 'row' }}
				gap={3}
				mb={4}
			>
				<HStack gap={2}>
					<UserPlus size={18} color='var(--chakra-colors-pink-300)' />
					<Heading as='h2' textStyle='h4' color='pink.300'>
						Friend requests received
					</Heading>
				</HStack>
				{viewAllHref && (
					<Link
						asChild
						textStyle='small'
						color='pink.200'
						textDecoration='underline'
						textUnderlineOffset='3px'
					>
						<NavLink to={viewAllHref}>View all</NavLink>
					</Link>
				)}
			</Flex>

			<Flex direction='column' gap={3}>
				{isFriendRequestsLoading && <Text textStyle='small'>Loading requests...</Text>}
				{!isFriendRequestsLoading &&
					!isFriendRequestsError &&
					friendRequests.received.length === 0 && (
						<Text textStyle='small'>No pending requests.</Text>
					)}
				{isFriendRequestsError && (
					<Text textStyle='small' color='red.400'>
						Error loading requests.
					</Text>
				)}

				{friendRequests.received.map((request, index) => (
					<Flex
						key={request.requesterId}
						align={{ base: 'start', md: 'center' }}
						justify='space-between'
						direction={{ base: 'column', md: 'row' }}
						gap={3}
						p={3}
						border='1px solid'
						borderColor='purple.700'
						borderRadius='md'
						animationName='slide-from-bottom, fade-in'
						animationDuration='320ms'
						animationTimingFunction='ease-out'
						animationFillMode='backwards'
						animationDelay={`${30 + index * 30}ms`}
					>
						<HStack gap={3}>
							<Avatar.Root size='sm'>
								<Avatar.Image src={request.requesterAvatarUrl ?? undefined} />
								<Avatar.Fallback name={request.requesterNickname} />
							</Avatar.Root>
							<Flex direction='column' gap={0}>
								<Text textStyle='small' color='pink.100' fontWeight='semibold'>
									{request.requesterName}
								</Text>
								<Link
									asChild
									textStyle='smaller'
									color='pink.200'
									textDecoration='underline'
									textUnderlineOffset='3px'
									_hover={{ color: 'pink.100' }}
									_focusVisible={{
										outline: '2px solid',
										outlineColor: 'pink.300',
										outlineOffset: '2px',
									}}
								>
									<NavLink to={`/authors/${request.requesterId}`}>
										@{request.requesterNickname}
									</NavLink>
								</Link>
							</Flex>
						</HStack>
						<Flex gap={2}>
							<IconButton
								aria-label='Accept request'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								onClick={() => onAcceptRequest(request.requesterId)}
								loading={isAccepting}
							>
								<Check />
							</IconButton>
							<IconButton
								aria-label='Decline request'
								size={{ base: 'xs', md: 'sm' }}
								variant='solidPink'
								colorPalette='gray'
								onClick={() => onRejectRequest(request.requesterId)}
								loading={isRejecting}
							>
								<X />
							</IconButton>
						</Flex>
					</Flex>
				))}
			</Flex>

			{errorMessage && (
				<Text mt={3} textStyle='small' color='red.400'>
					{errorMessage}
				</Text>
			)}
		</Surface>
	);
}

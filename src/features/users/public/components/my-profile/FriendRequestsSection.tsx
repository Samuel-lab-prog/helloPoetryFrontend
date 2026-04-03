import { Surface } from '@BaseComponents';
import { Avatar, Flex, Heading, HStack, IconButton, Link, Text } from '@chakra-ui/react';
import { Check, UserPlus, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import type { MyFriendRequestsType } from '../../hooks/useMyFriendRequests';

type FriendRequestsSectionProps = {
	friendRequests: MyFriendRequestsType;
	viewAllHref?: string;
	isFriendRequestsLoading: boolean;
	isFriendRequestsError: boolean;
	isSearchingFriendRequests?: boolean;
	isAccepting: boolean;
	isRejecting: boolean;
	errorMessage: string;
	onAcceptRequest: (requesterId: number) => void;
	onRejectRequest: (requesterId: number) => void;
};
/**
 * Renders the section for displaying the user's received friend requests.
 * @param friendRequests - The list of received friend requests to display. The type is **FriendRequests**
 * @param viewAllHref - The URL to view all friend requests if there are more than the displayed ones.[optional]
 * @param isFriendRequestsLoading - Indicates if the friend requests are currently being loaded.
 * @param isFriendRequestsError - Indicates if there was an error loading the friend requests.
 * @param isAccepting - Indicates if a friend request is currently being accepted.
 * @param isRejecting - Indicates if a friend request is currently being rejected.
 * @param errorMessage - An error message to display if there was an error accepting or rejecting a friend request.
 * @param onAcceptRequest - Callback function to accept a friend request when the "Accept" action is selected.
 * @param onRejectRequest - Callback function to reject a friend request when the "Reject" action is selected.
 * @returns A React component that displays the list of received friend requests with options to accept or reject each request, along with loading and error states.
 */
export function FriendRequestsSection({
	friendRequests,
	viewAllHref,
	isFriendRequestsLoading,
	isFriendRequestsError,
	isSearchingFriendRequests,
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

			<Flex direction='column' gap={1}>
				{isFriendRequestsLoading && <Text textStyle='small'>Loading requests...</Text>}
				{!isFriendRequestsLoading &&
					!isFriendRequestsError &&
					friendRequests.received.length === 0 && (
						<Text textStyle='small'>
							{isSearchingFriendRequests
								? 'No requests found for your search.'
								: 'No pending requests.'}
						</Text>
					)}
				{isFriendRequestsError && (
					<Text textStyle='small' color='red.400'>
						Error loading requests.
					</Text>
				)}

				{friendRequests.received.map((request, index) => (
					<Flex
						key={request.requesterId}
						align='center'
						justify='space-between'
						direction='row'
						gap={3}
						py={3}
						borderTop='1px solid'
						borderColor='border'
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
						<Flex gap={2} ml='auto'>
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

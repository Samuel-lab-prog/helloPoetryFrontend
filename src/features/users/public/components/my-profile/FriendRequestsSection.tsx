import { Surface } from '@BaseComponents';
import { Avatar, Box, Button, Flex, Heading, HStack, Link, Text } from '@chakra-ui/react';
import type { MyFriendRequestsType } from '@core/ports/friends';
import { Check, UserPlus, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type FriendRequestsSectionProps = {
	friendRequests: MyFriendRequestsType;
	totalFriendRequestsCount?: number;
	viewAllHref?: string;
	isFriendRequestsLoading: boolean;
	isFriendRequestsError: boolean;
	friendRequestsErrorMessage?: string;
	isSearchingFriendRequests?: boolean;
	isAccepting: (requesterId: number) => boolean;
	isRejecting: (requesterId: number) => boolean;
	isRemovingRequester?: (requesterId: number) => boolean;
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
 * @param isAccepting - Indicates if a specific friend request is currently being accepted.
 * @param isRejecting - Indicates if a specific friend request is currently being rejected.
 * @param errorMessage - An error message to display if there was an error accepting or rejecting a friend request.
 * @param onAcceptRequest - Callback function to accept a friend request when the "Accept" action is selected.
 * @param onRejectRequest - Callback function to reject a friend request when the "Reject" action is selected.
 * @returns A React component that displays the list of received friend requests with options to accept or reject each request, along with loading and error states.
 */
export function FriendRequestsSection({
	friendRequests,
	totalFriendRequestsCount,
	viewAllHref,
	isFriendRequestsLoading,
	isFriendRequestsError,
	friendRequestsErrorMessage,
	isSearchingFriendRequests,
	isAccepting,
	isRejecting,
	isRemovingRequester,
	errorMessage,
	onAcceptRequest,
	onRejectRequest,
}: FriendRequestsSectionProps) {
	return (
		<Surface p={5} variant='panel'>
			<Flex align='center' justify='space-between' direction='row' gap={3} mb={2} w='full'>
				<HStack gap={2}>
					<UserPlus size={18} color='var(--chakra-colors-pink-300)' />
					<Heading as='h2' textStyle='h5' color='pink.300' textTransform='none'>
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
						flexShrink={0}
					>
						<NavLink to={viewAllHref}>View all</NavLink>
					</Link>
				)}
			</Flex>
			{viewAllHref && Boolean(totalFriendRequestsCount) && (
				<Text mb={4} textStyle='smaller' color='pink.200' textAlign='left'>
					Showing {friendRequests.received.length} of {totalFriendRequestsCount} requests
				</Text>
			)}

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
						{friendRequestsErrorMessage || 'Error loading requests.'}
					</Text>
				)}

				{!isFriendRequestsError &&
					friendRequests.received.map((request, index) => {
						const isRemoving = isRemovingRequester?.(request.requesterId) ?? false;
						return (
							<Box
								key={request.requesterId}
								overflow='hidden'
								maxH={isRemoving ? '0px' : '96px'}
								opacity={isRemoving ? 0 : 1}
								transform={isRemoving ? 'translateY(-6px)' : 'translateY(0)'}
								transition='max-height 0.22s ease, opacity 0.18s ease, transform 0.22s ease'
								pointerEvents={isRemoving ? 'none' : 'auto'}
								animationName='slide-from-bottom, fade-in'
								animationDuration='320ms'
								animationTimingFunction='ease-out'
								animationFillMode='backwards'
								animationDelay={`${30 + index * 30}ms`}
								borderTop='1px solid'
								borderColor='border'
							>
								<Flex
									align={{ base: 'stretch', md: 'center' }}
									justify='space-between'
									direction={{ base: 'column', md: 'row' }}
									gap={3}
									py={3}
								>
									<Link asChild display='inline-flex' w='fit-content' alignSelf='start'>
										<NavLink to={`/authors/${request.requesterId}`}>
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
												<Avatar.Root size='sm'>
													<Avatar.Image src={request.requesterAvatarUrl ?? undefined} />
													<Avatar.Fallback name={request.requesterNickname} />
												</Avatar.Root>
												<Flex direction='column' minW={0} gap={0}>
													<Text textStyle='small' color='pink.100' lineHeight='short' truncate>
														{request.requesterName}
													</Text>
													<Text textStyle='smaller' color='pink.200' opacity={0.9}>
														@{request.requesterNickname}
													</Text>
												</Flex>
											</Flex>
										</NavLink>
									</Link>
									<Flex
										w={{ base: 'full', md: 'auto' }}
										gap={2}
										ml={{ base: 0, md: 'auto' }}
										direction={{ base: 'column', sm: 'row' }}
									>
										<Button
											aria-label='Accept request'
											size='sm'
											variant='solidPink'
											colorPalette='green'
											onClick={() => onAcceptRequest(request.requesterId)}
											loading={isAccepting(request.requesterId)}
											disabled={isRemoving}
											w={{ base: 'full', sm: 'auto' }}
											minH='44px'
											justifyContent='center'
										>
											<Check />
											Accept
										</Button>
										<Button
											aria-label='Decline request'
											size='sm'
											variant='danger'
											onClick={() => onRejectRequest(request.requesterId)}
											loading={isRejecting(request.requesterId)}
											disabled={isRemoving}
											w={{ base: 'full', sm: 'auto' }}
											minH='44px'
											justifyContent='center'
										>
											<X />
											Reject
										</Button>
									</Flex>
								</Flex>
							</Box>
						);
					})}
			</Flex>

			{errorMessage && (
				<Text mt={3} textStyle='small' color='red.400'>
					{errorMessage}
				</Text>
			)}
		</Surface>
	);
}

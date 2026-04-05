import { AsyncState } from '@BaseComponents';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import {
	useCancelFriendRequest,
	useFriendRequestActions,
	useSendFriendRequest,
} from '@features/interactions/public';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AuthorPoemsSection } from './components/AuthorPoemsSection';
import { AuthorProfileCard } from './components/AuthorProfileCard';
import { LoadingAuthorProfileSkeleton } from './components/skeletons/LoadingAuthorProfileSkeleton';
import { canSendFriendRequest, getRelationStatus } from './components/utils';
import { useAuthorProfile } from './hooks/useAuthorProfile';

export function AuthorPage() {
	const { id } = useParams<{ id: string }>();
	const authorId = Number(id);
	const isValidAuthorId = Number.isInteger(authorId) && authorId > 0;
	const authClientId = useAuthClientStore((state) => state.authClient?.id ?? -1);

	const { author, isLoading: isAuthorLoading, isError: isAuthorError } = useAuthorProfile(authorId);
	const { sendFriendRequest, isSending, errorMessage, reset } = useSendFriendRequest();
	const {
		acceptRequest,
		isAccepting,
		rejectRequest,
		isRejecting,
		errorMessage: rejectErrorMessage,
	} = useFriendRequestActions();
	const {
		cancelFriendRequest,
		isCancelling,
		errorMessage: cancelErrorMessage,
	} = useCancelFriendRequest();

	useEffect(() => reset(), [authorId, reset]);

	const isAuthenticated = authClientId > 0;
	const isSelf = !!author && author.id === authClientId;
	const hasOutgoingRequest = !!author && author.isFriendRequester;
	const hasIncomingRequest = !!author && author.hasIncomingFriendRequest;

	const canSendRequest = canSendFriendRequest({
		author,
		flags: {
			isAuthenticated,
			isSelf,
			hasOutgoingRequest,
			hasIncomingRequest,
		},
	});

	const relationStatus = getRelationStatus(author, {
		isAuthenticated,
		isSelf,
		hasOutgoingRequest,
		hasIncomingRequest,
	});

	const isActionBusy = isSending || isCancelling || isRejecting || isAccepting;

	const action = author
		? {
				label: canSendRequest
					? 'Send friend request'
					: hasOutgoingRequest
						? 'Cancel request'
						: hasIncomingRequest
							? 'Accept request'
							: null,
				secondaryLabel: hasIncomingRequest ? 'Reject request' : null,
				onClick: isActionBusy
					? undefined
					: canSendRequest
						? () => sendFriendRequest(author.id)
						: hasOutgoingRequest
							? () => cancelFriendRequest(author.id)
							: hasIncomingRequest
								? () => acceptRequest(author.id)
								: undefined,
				secondaryOnClick:
					isActionBusy || !hasIncomingRequest ? undefined : () => rejectRequest(author.id),
				isLoading: isActionBusy ? isSending || isCancelling || isRejecting || isAccepting : false,
				disabled: isActionBusy || (!canSendRequest && !hasOutgoingRequest && !hasIncomingRequest),
			}
		: null;

	const actionErrorMessage = errorMessage || rejectErrorMessage || cancelErrorMessage;

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center' gap={8}>
			<Box w='full' maxW='4xl'>
				{!isValidAuthorId ? (
					<Text textStyle='body'>Invalid author.</Text>
				) : (
					<AsyncState
						isLoading={isAuthorLoading}
						isError={isAuthorError}
						isEmpty={!author}
						loadingElement={LoadingAuthorProfileSkeleton}
						errorElement={<Text textStyle='body'>Error loading author.</Text>}
						emptyElement={<Text textStyle='body'>Author not found.</Text>}
					>
						{author && (
							<AuthorProfileCard
								author={author}
								relationStatus={relationStatus}
								action={action}
								errorMessage={actionErrorMessage}
							/>
						)}
					</AsyncState>
				)}
			</Box>

			<Box w='full' maxW='4xl'>
				<AuthorPoemsSection
					poems={author?.poems ?? []}
					isLoading={isAuthorLoading}
					isError={isAuthorError}
				/>
			</Box>
		</Flex>
	);
}

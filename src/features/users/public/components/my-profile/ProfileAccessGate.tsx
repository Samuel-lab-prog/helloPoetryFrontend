import { Flex } from '@chakra-ui/react';
import { AuthRequiredCard } from '@features/auth/public';

/**
 * Renders a gate that restricts access to the user's profile if they are not signed in.
 * It encourages users to sign in or create an account to access their profile features.
 * @returns A React component that displays a message and buttons for signing in or creating an account.
 */
export function ProfileAccessGate() {
	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='center' w='full'>
			<AuthRequiredCard
				maxW='2xl'
				eyebrow='PROFILE UNAVAILABLE'
				title='Sign in to view your profile'
				description='This page is available only after sign in. Sign in to view saved poems, friend requests, collections, and your stats.'
			/>
		</Flex>
	);
}

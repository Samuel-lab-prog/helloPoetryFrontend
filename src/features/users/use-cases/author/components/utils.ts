import type { AuthorProfileType } from '@root/features/poems/types';
import { Clock3, LogIn, type LucideIcon, UserCheck, UserPlus, UserX } from 'lucide-react';

export type RelationStatus = {
	icon: LucideIcon;
	color: string;
	text: string;
};

type RelationFlags = {
	isAuthenticated: boolean;
	isSelf: boolean;
	hasOutgoingRequest: boolean;
	hasIncomingRequest: boolean;
};

/**
 * Determines the relationship status between the authenticated user and the author.
 * @param author - The author's profile information, including relationship flags.
 * @param flags - Additional flags indicating the authentication and relationship state.
 * @returns An object containing the appropriate icon, color, and text for the relationship status, or null if no status applies.
 */
export function getRelationStatus(
	author: AuthorProfileType | undefined,
	flags: RelationFlags,
): RelationStatus | null {
	if (!author) return null;
	if (!flags.isAuthenticated) {
		return { icon: LogIn, color: 'pink.200', text: 'Sign in to send a request.' };
	}
	if (flags.isSelf) return null;
	if (author.hasBlockedRequester) {
		return { icon: UserX, color: 'red.300', text: 'You were blocked by this user.' };
	}
	if (author.isBlockedByRequester) {
		return { icon: UserX, color: 'red.300', text: 'You blocked this user.' };
	}
	if (author.isFriend) return { icon: UserCheck, color: 'green.300', text: 'You are friends.' };
	if (flags.hasOutgoingRequest) return { icon: Clock3, color: 'yellow.300', text: 'Request sent.' };
	if (flags.hasIncomingRequest) {
		return { icon: UserPlus, color: 'yellow.300', text: 'Request received.' };
	}
	return null;
}

type CanSendFriendRequestParams = {
	author: AuthorProfileType | undefined;
	flags: RelationFlags;
};

/**
 * Determines whether the authenticated user can send a friend request to the author.
 * @param author - The author's profile information, including relationship flags.
 * @param flags - Additional flags indicating the authentication and relationship state.
 * @returns A boolean indicating whether a friend request can be sent.
 */
export function canSendFriendRequest({ author, flags }: CanSendFriendRequestParams): boolean {
	if (!author) return false;
	if (!flags.isAuthenticated) return false;
	if (flags.isSelf) return false;
	if (author.isFriend) return false;
	if (author.hasBlockedRequester) return false;
	if (author.isBlockedByRequester) return false;
	if (flags.hasOutgoingRequest) return false;
	if (flags.hasIncomingRequest) return false;
	return true;
}

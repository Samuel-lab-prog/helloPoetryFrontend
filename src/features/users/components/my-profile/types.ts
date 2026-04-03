import type { FullPoemType, PoemCollectionType, SavedPoemType } from '@root/features/poems/types';

import type { MyFriendRequestsType } from '../../hooks/useMyFriendRequests';

export type MyProfileViewModel = {
	id: number;
	nickname: string;
	name: string;
	bio: string;
	avatarUrl: string | null;
	email: string;
	stats: {
		poems: { id: number; title: string }[];
		commentsIds: number[];
		friends: { id: number }[];
	};
};

export type FriendRequestsSectionProps = {
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

export type MyPoemsSectionProps = {
	myPoems: FullPoemType[];
	totalPoemsCount?: number;
	viewAllHref?: string;
	isLoadingMyPoems: boolean;
	isMyPoemsError: boolean;
	isSearchingMyPoems?: boolean;
	onOpenPoem: (slug: string, id: number) => void;
	onUpdatePoem: (id: number) => void;
	onDeletePoem: (id: number) => void;
};

export type CollectionsSectionProps = {
	profile: MyProfileViewModel;
	collections: PoemCollectionType[];
	totalCollectionsCount?: number;
	viewAllHref?: string;
	showManagementControls?: boolean;
	myPoems: FullPoemType[];
	savedPoems: SavedPoemType[];
	isLoadingCollections: boolean;
	isUpdatingCollections: boolean;
	collectionsError: string;
	onCreateCollection: (input: {
		userId: number;
		name: string;
		description?: string;
	}) => Promise<void>;
	onDeleteCollection: (collectionId: number) => Promise<void>;
	onAddPoemToCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
	onRemovePoemFromCollection: (input: { collectionId: number; poemId: number }) => Promise<void>;
};

export type SavedPoemsSectionProps = {
	savedPoems: SavedPoemType[];
	totalSavedPoemsCount?: number;
	viewAllHref?: string;
	isLoadingSavedPoems: boolean;
	isSavingPoem?: boolean;
	saveError?: string;
	isSearchingSavedPoems?: boolean;
	onUnsavePoem?: (poemId: number) => Promise<void>;
};

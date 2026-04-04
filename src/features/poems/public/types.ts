import type { FullPoem, PoemPreview } from '@Api/poems/types';

export type {
	CollectionItemBody,
	CreateCollectionBody,
	CreatePoemBody,
	CreatePoemResult,
	FullPoem,
	FullPoem as FullPoemType,
	PaginatedPoems,
	PaginatedPoems as PaginatedPoemsType,
	PoemAudioUploadUrlRequest,
	PoemAudioUploadUrlResponse,
	PoemAuthor,
	PoemAuthor as PoemAuthorType,
	PoemCollection,
	PoemCollection as PoemCollectionType,
	PoemDedicationUser,
	PoemPreview,
	PoemPreview as PoemPreviewType,
	PoemStatus,
	PoemTag,
	PoemVisibility,
	SavedPoem,
	SavedPoem as SavedPoemType,
	SearchPoemsParams,
	PoemTag as TagType,
	UpdatePoemAudioBody,
	UpdatePoemAudioResponse,
	UpdatePoemBody,
	UpdatePoemResult,
} from '@Api/poems/types';

export type PoemMinimalDataType = Pick<FullPoem, 'id' | 'title'>;

export type AuthorProfileType = {
	id: number;
	nickname: string;
	name: string;
	bio: string | null;
	avatarUrl: string | null;
	role: string;
	status: string;
	poems: PoemPreview[];
	stats: {
		poemsCount: number;
		commentsCount: number;
		friendsCount: number;
	};
	isFriend: boolean;
	hasBlockedRequester: boolean;
	isBlockedByRequester: boolean;
	isFriendRequester: boolean;
	hasIncomingFriendRequest: boolean;
};

export type PaginatedMinimalPoemsType = {
	nextCursor?: number | null;
	hasMore: boolean;
	poems: {
		id: number;
		title: string;
	}[];
};

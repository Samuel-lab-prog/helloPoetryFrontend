import type {
	PoemAuthor,
	PoemDedicationUser,
	PoemStatus,
	PoemTag,
	PoemVisibility,
} from '@features/poems/public/types';

export type BanUserBody = {
	userId: string;
	reason: string;
};

export type SuspendUserBody = {
	userId: string;
	reason: string;
};

export type BannedUserResponse = {
	id: number;
	moderatorId: number;
	bannedUserId: number;
	reason: string;
	bannedAt: string;
};

export type SuspendedUserResponse = {
	id: number;
	moderatorId: number;
	suspendedUserId: number;
	reason: string;
	suspendedAt: string;
	endAt: string;
};

export type ModerationPoem = {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	audioUrl: string | null;
	tags: PoemTag[];
	status: PoemStatus;
	visibility: PoemVisibility;
	moderationStatus: 'rejected' | 'removed' | 'approved' | 'pending';
	isCommentable: boolean;
	createdAt: string | Date;
	updatedAt: string | Date;
	toUsers: PoemDedicationUser[];
	author: PoemAuthor;
	stats: {
		likesCount: number;
		commentsCount: number;
	};
};

export type ModeratePoemBody = {
	poemId: string;
	moderationStatus: 'approved' | 'rejected' | 'removed';
	reason?: string;
};

export type ModeratePoemResult = {
	id: number;
	moderationStatus: 'rejected' | 'removed' | 'approved' | 'pending';
};

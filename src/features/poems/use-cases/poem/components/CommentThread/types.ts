import { type PoemCommentType } from '@features/interactions/public';
import { type Dispatch, type SetStateAction } from 'react';

export interface CommentThreadProps {
	/**
	 * Comment item to render, including author and counts for likes/replies.
	 */
	comment: PoemCommentType;
	/**
	 * Parent comment author info, used to render breadcrumb text.
	 */
	parentAuthorId?: number;
	parentAuthorNickname?: string;
	/**
	 * Hide the top divider for the first item in a list.
	 */
	hideTopBorder?: boolean;
	/**
	 * The authenticated client id, used to decide when the delete action is shown.
	 */
	authClientId: number;
	/**
	 * Whether the current poem allows new comments/replies.
	 */
	poemIsCommentable: boolean;
	/**
	 * Whether the user is authenticated (enables reply/like/delete actions).
	 */
	isAuthenticated: boolean;
	/**
	 * Loading state for creating a new reply.
	 */
	isCreatingComment: boolean;
	/**
	 * Loading state for deleting a comment.
	 */
	isDeletingComment: (commentId: number) => boolean;
	/**
	 * Creates a new comment or reply.
	 */
	createComment: (args: { content: string; parentId?: number }) => Promise<void>;
	/**
	 * Deletes a comment by id (optionally scoped to a parent comment).
	 */
	deleteComment: (args: { id: number; parentId?: number }) => Promise<void>;
	/**
	 * Fetches replies for a parent comment, optionally forcing a refresh.
	 */
	fetchReplies: (parentId: number, options?: { force?: boolean }) => Promise<PoemCommentType[]>;
	/**
	 * Cached replies keyed by parent comment id.
	 */
	repliesByCommentId: Record<number, PoemCommentType[]>;
	/**
	 * Setter for cached replies keyed by parent comment id.
	 */
	setRepliesByCommentId: Dispatch<SetStateAction<Record<number, PoemCommentType[]>>>;
}

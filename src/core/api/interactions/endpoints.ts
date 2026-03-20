import { createHTTPRequest } from '@http-request';
import { createMutationEndpoint, createQueryEndpoint } from '../utils';

import { interactionsKeys } from './keys';
import type { CommentPoemBody, PoemComment, UpdateCommentBody } from './types';

const getPoemComments = createQueryEndpoint<[string, string?], PoemComment[]>({
	key: interactionsKeys.commentsByPoem,

	fn: (poemId, parentId) =>
		createHTTPRequest<PoemComment[]>({
			method: 'GET',
			path: `/interactions/poems/${poemId}/comments`,
			query: { parentId },
		}),
});

const likePoem = createMutationEndpoint<string, void>({
	fn: (poemId) =>
		createHTTPRequest<void>({
			method: 'POST',
			path: `/interactions/poems/${poemId}/like`,
		}),
});

const unlikePoem = createMutationEndpoint<string, void>({
	fn: (poemId) =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/interactions/poems/${poemId}/like`,
		}),
});

const commentPoem = createMutationEndpoint<CommentPoemBody, void>({
	fn: (data) =>
		createHTTPRequest<void, Omit<CommentPoemBody, 'poemId'>>({
			method: 'POST',
			path: `/interactions/poems/${data.poemId}/comments`,
			body: {
				content: data.content,
				parentId: data.parentId,
			},
		}),
});

const deleteComment = createMutationEndpoint<string, void>({
	fn: (commentId) =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/interactions/comments/${commentId}`,
		}),
});

const likeComment = createMutationEndpoint<string, void>({
	fn: (commentId) =>
		createHTTPRequest<void>({
			method: 'POST',
			path: `/interactions/comments/${commentId}/like`,
		}),
});

const unlikeComment = createMutationEndpoint<string, void>({
	fn: (commentId) =>
		createHTTPRequest<void>({
			method: 'DELETE',
			path: `/interactions/comments/${commentId}/like`,
		}),
});

const updateComment = createMutationEndpoint<UpdateCommentBody, void>({
	fn: (data) =>
		createHTTPRequest<void, Omit<UpdateCommentBody, 'commentId'>>({
			method: 'PATCH',
			path: `/interactions/comments/${data.commentId}`,
			body: {
				content: data.content,
			},
		}),
});

export const interactions = {
	getPoemComments,
	likePoem,
	unlikePoem,
	commentPoem,
	deleteComment,
	likeComment,
	unlikeComment,
	updateComment,
};

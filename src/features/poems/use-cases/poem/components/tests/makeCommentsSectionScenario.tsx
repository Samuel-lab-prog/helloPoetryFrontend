import { interactionsKeys } from '@Api/interactions/keys';
import { createTestQueryClient } from '@root/core/testing/renderHookWithQueryClient';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { type ComponentProps, useState } from 'react';
import { vi } from 'vitest';

import { CommentsSection } from '../CommentsSection';
import { authCacheScope, authClientId, poemId, replyComment, rootComment } from './fixtures';

type CommentsSectionProps = ComponentProps<typeof CommentsSection>;

function makeDefaultMocks(queryClient: ReturnType<typeof createTestQueryClient>) {
	return {
		isDeletingComment: vi.fn<(commentId: number) => boolean>().mockReturnValue(false),
		onLoadMoreComments: vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined),
		onCommentInputChange: vi.fn<(value: string) => void>(),
		onPublishComment: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
		createComment: vi
			.fn<(args: { content: string; parentId?: number }) => Promise<void>>()
			.mockResolvedValue(undefined),
		deleteComment: vi
			.fn<(args: { id: number; parentId?: number }) => Promise<void>>()
			.mockResolvedValue(undefined),
		likeComment: vi.fn<CommentsSectionProps['likeComment']>().mockResolvedValue(undefined),
		unlikeComment: vi.fn<CommentsSectionProps['unlikeComment']>().mockResolvedValue(undefined),
		fetchReplies: vi.fn<CommentsSectionProps['fetchReplies']>().mockImplementation((parentId) => {
			queryClient.setQueryData(
				interactionsKeys.commentsByPoem(String(poemId), {
					authScope: authCacheScope,
					parentId: String(parentId),
				}),
				{ comments: [replyComment], hasMore: false },
			);
			return Promise.resolve([replyComment]);
		}),
		prefetchReplies: vi.fn<CommentsSectionProps['prefetchReplies']>().mockResolvedValue(undefined),
	};
}

// eslint-disable-next-line react-refresh/only-export-components
function CommentsSectionHarness({ props }: { props: CommentsSectionProps }) {
	const [commentInput, setCommentInput] = useState(props.commentInput);

	return (
		<CommentsSection
			{...props}
			commentInput={commentInput}
			onCommentInputChange={(value) => {
				setCommentInput(value);
				props.onCommentInputChange(value);
			}}
		/>
	);
}

export function makeCommentsSectionScenario() {
	const queryClient = createTestQueryClient();
	const mocks = makeDefaultMocks(queryClient);
	const props: CommentsSectionProps = {
		poemId,
		authScope: authCacheScope,
		poemIsCommentable: true,
		isAuthenticated: true,
		commentInput: '',
		commentError: '',
		authClientId,
		comments: [],
		isLoadingComments: false,
		isCommentsError: false,
		commentsError: '',
		isCreatingComment: false,
		isDeletingComment: mocks.isDeletingComment,
		likeComment: mocks.likeComment,
		unlikeComment: mocks.unlikeComment,
		updatingLikeCommentIds: new Set(),
		hasMoreComments: false,
		isLoadingMoreComments: false,
		onLoadMoreComments: mocks.onLoadMoreComments,
		onCommentInputChange: mocks.onCommentInputChange,
		onPublishComment: mocks.onPublishComment,
		createComment: mocks.createComment,
		deleteComment: mocks.deleteComment,
		fetchReplies: mocks.fetchReplies,
		prefetchReplies: mocks.prefetchReplies,
	};

	const scenario = {
		mocks,
		asLoggedOutVisitor() {
			props.isAuthenticated = false;
			props.authClientId = 0;
			return scenario;
		},
		withComments(comments = [rootComment]) {
			props.comments = comments;
			return scenario;
		},
		withCommentInput(value: string) {
			props.commentInput = value;
			return scenario;
		},
		withCommentError(message: string) {
			props.commentError = message;
			return scenario;
		},
		withCommentsDisabled() {
			props.poemIsCommentable = false;
			return scenario;
		},
		withCommentsError(message = '') {
			props.isCommentsError = true;
			props.commentsError = message;
			return scenario;
		},
		withRestrictionMessage(message: string) {
			props.commentRestrictionMessage = message;
			return scenario;
		},
		withLoadMoreComments() {
			props.hasMoreComments = true;
			return scenario;
		},
		withRepliesLoaded() {
			queryClient.setQueryData(
				interactionsKeys.commentsByPoem(String(poemId), {
					authScope: authCacheScope,
					parentId: String(rootComment.id),
				}),
				{ comments: [replyComment], hasMore: false },
			);
			return scenario;
		},
		withFetchReplies(replies = [replyComment]) {
			mocks.fetchReplies.mockImplementation((parentId) => {
				queryClient.setQueryData(
					interactionsKeys.commentsByPoem(String(poemId), {
						authScope: authCacheScope,
						parentId: String(parentId),
					}),
					{ comments: replies, hasMore: false },
				);
				return Promise.resolve(replies);
			});
			return scenario;
		},
		render() {
			return renderWithProviders(<CommentsSectionHarness props={props} />, { queryClient });
		},
	};

	return scenario;
}

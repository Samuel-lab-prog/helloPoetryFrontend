// @vitest-environment happy-dom
import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createdPoem,createPoemData } from './fixtures';
import { makeCreatePoemFormScenario } from './makeCreatePoemFormScenario';

describe('FEATURE HOOK - Poems - useCreatePoemForm', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('blocks submission and marks the field when forbidden words are present', async () => {
		const scenario = makeCreatePoemFormScenario().withCreateSuccess();

		const { result } = scenario.render();
		void result.current.formState.errors.title;

		await act(async () => {
			await result.current.onSubmit({
				...createPoemData,
				title: 'bosta title',
			});
		});

		expect(scenario.mocks.createPoem).not.toHaveBeenCalled();
		expect(result.current.formState.errors.title?.message).toContain('Remove forbidden words');
	});

	it('creates the poem, publishes the event, calls the completion callback, and shows success', async () => {
		const scenario = makeCreatePoemFormScenario().withCreateSuccess();

		const { result } = scenario.render();

		await act(async () => {
			await result.current.onSubmit(createPoemData);
		});

		expect(scenario.mocks.createPoem).toHaveBeenCalledWith({
			title: createPoemData.title,
			excerpt: createPoemData.excerpt,
			content: createPoemData.content,
			tags: createPoemData.tags,
			status: createPoemData.status,
			visibility: createPoemData.visibility,
			isCommentable: createPoemData.isCommentable,
			toUserIds: createPoemData.toUserIds,
		});
		expect(scenario.mocks.onCreated).toHaveBeenCalledWith(createdPoem, createPoemData);
		expect(scenario.mocks.poemCreated).toHaveBeenCalledWith(
			'poemCreated',
			expect.objectContaining({ poemId: createdPoem.id }),
		);
		expect(scenario.mocks.toaster).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'success',
				title: 'Poem created',
			}),
		);
	});

	it('maps duplicate title conflicts to the title field', async () => {
		const scenario = makeCreatePoemFormScenario().withCreateFailure({
			statusCode: 409,
			message: 'same title',
		});

		const { result } = scenario.render();
		void result.current.formState.errors.title;

		await act(async () => {
			await result.current.onSubmit(createPoemData);
		});

		await waitFor(() =>
			expect(result.current.formState.errors.title?.message).toBe(
				'You already have a poem with this title.',
			),
		);
	});
});

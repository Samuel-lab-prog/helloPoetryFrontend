import { poems } from '@Api/poems/endpoints';
import { toaster } from '@BaseComponents';
import { eventBus } from '@root/core/events/eventBus';
import {
	createQueryClientWrapper,
	createTestQueryClient,
} from '@root/core/testing/renderHookWithQueryClient';
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCreatePoemForm } from '../useCreatePoemForm';
import { createdPoem } from './fixtures';

export function makeCreatePoemFormScenario() {
	const queryClient = createTestQueryClient();
	const onCreated = vi.fn();
	const scenario = {
		queryClient,
		mocks: {
			onCreated,
			toaster: vi.spyOn(toaster, 'create').mockReturnValue('toast-id'),
			poemCreated: vi.spyOn(eventBus, 'publish').mockResolvedValue(),
		} as Record<string, unknown>,
		withCreateSuccess() {
			scenario.mocks.createPoem = vi.spyOn(poems.createPoem, 'mutate').mockResolvedValue(createdPoem);
			return scenario;
		},
		withCreateFailure(error: unknown) {
			scenario.mocks.createPoem = vi.spyOn(poems.createPoem, 'mutate').mockRejectedValue(error);
			return scenario;
		},
		render() {
			return renderHook(
				() =>
					useCreatePoemForm({
						onCreated,
					}),
				{
					wrapper: createQueryClientWrapper(queryClient),
				},
			);
		},
	};

	return scenario;
}

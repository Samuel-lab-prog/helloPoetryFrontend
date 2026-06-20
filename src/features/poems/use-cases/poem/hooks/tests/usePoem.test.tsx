// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fullPoem } from './fixtures';
import { makePoemScenario } from './makePoemScenario';

describe('FEATURE HOOK - Poems - usePoem', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('loads a poem with the viewer-scoped query key', async () => {
		const scenario = makePoemScenario()
			.asAuthenticatedUser()
			.withPoemSuccess();

		const { result } = scenario.render();

		await waitFor(() => expect(result.current.poem?.id).toBe(fullPoem.id));

		expect(scenario.mocks.queryFn).toHaveBeenCalledTimes(1);
		expect(result.current.isError).toBe(false);
	});

	it('does not execute the query function for invalid poem ids', async () => {
		const scenario = makePoemScenario()
			.asLoggedOutVisitor()
			.withPoemSuccess();

		const { result } = scenario.render(0);

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		expect(result.current.poem).toBeUndefined();
		expect(scenario.mocks.queryFn).not.toHaveBeenCalled();
	});

	it('does not retry not-found poem responses', async () => {
		const scenario = makePoemScenario()
			.asAuthenticatedUser()
			.withPoemFailure({ statusCode: 404 });

		const { result } = scenario.render();

		await waitFor(() => expect(result.current.isError).toBe(true));

		expect(scenario.mocks.queryFn).toHaveBeenCalledTimes(1);
	});
});

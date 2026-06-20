// @vitest-environment happy-dom
import { waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { makePoetsSearchScenario } from './makePoetsSearchScenario';

describe('FEATURE HOOK - Users - usePoetsSearch', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('uses the public users endpoint with default limit and no empty search param', async () => {
		const scenario = makePoetsSearchScenario().withPublicUsers();

		const { result } = scenario.render('   ');

		await waitFor(() => expect(result.current.poets).toHaveLength(1));

		expect(result.current.poets[0]?.nickname).toBe('public-poet');
		expect(scenario.mocks.getPublicUsers).toHaveBeenCalledWith({
			limit: 10,
			searchNickname: undefined,
		});
	});

	it('trims the nickname search and applies the requested limit', async () => {
		const scenario = makePoetsSearchScenario().withPublicUsers();

		const { result } = scenario.render('  poet  ', 3);

		await waitFor(() => expect(result.current.poets).toHaveLength(1));

		expect(scenario.mocks.getPublicUsers).toHaveBeenCalledWith({
			limit: 3,
			searchNickname: 'poet',
		});
	});
});

import { beforeEach, describe, expect, it } from 'vitest';

import { queryClient } from '../queryClient';
import { restoreSnapshot, restoreSnapshots, snapshotQueriesData, snapshotQueryData } from './optimistic';

describe('API - optimistic helpers', () => {
	beforeEach(() => {
		queryClient.clear();
	});

	it('snapshotQueryData captures and restores a single query', async () => {
		const key = ['user', '1'] as const;
		queryClient.setQueryData(key, { name: 'Old name' });

		const snapshot = await snapshotQueryData<{ name: string }>(queryClient, key);
		queryClient.setQueryData(key, { name: 'New name' });

		restoreSnapshot(queryClient, snapshot);

		expect(queryClient.getQueryData(key)).toEqual({ name: 'Old name' });
	});

	it('snapshotQueriesData captures and restores multiple queries', async () => {
		const keyA = ['notifications', 'page', 1] as const;
		const keyB = ['notifications', 'page', 2] as const;
		queryClient.setQueryData(keyA, { value: 'A' });
		queryClient.setQueryData(keyB, { value: 'B' });

		const snapshots = await snapshotQueriesData<{ value: string }>(
			queryClient,
			['notifications'] as const,
		);
		queryClient.setQueryData(keyA, { value: 'A2' });
		queryClient.setQueryData(keyB, { value: 'B2' });

		restoreSnapshots(queryClient, snapshots);

		expect(queryClient.getQueryData(keyA)).toEqual({ value: 'A' });
		expect(queryClient.getQueryData(keyB)).toEqual({ value: 'B' });
	});
});

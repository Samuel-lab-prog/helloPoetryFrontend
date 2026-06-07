import type { QueryClient, QueryKey } from '@tanstack/react-query';

export type OptimisticSnapshot<TData = unknown> = {
	queryKey: QueryKey;
	data: TData | undefined;
};

export async function snapshotQueryData<TData>(
	queryClient: QueryClient,
	queryKey: QueryKey,
): Promise<OptimisticSnapshot<TData>> {
	await queryClient.cancelQueries({ queryKey });

	return {
		queryKey,
		data: queryClient.getQueryData<TData>(queryKey),
	};
}

export async function snapshotQueriesData<TData>(
	queryClient: QueryClient,
	queryKey: QueryKey,
): Promise<Array<OptimisticSnapshot<TData>>> {
	await queryClient.cancelQueries({ queryKey });

	return queryClient.getQueriesData<TData>({ queryKey }).map(([resolvedKey, data]) => ({
		queryKey: resolvedKey,
		data,
	}));
}

export function restoreSnapshot<TData>(
	queryClient: QueryClient,
	snapshot?: OptimisticSnapshot<TData>,
) {
	if (!snapshot) return;
	queryClient.setQueryData(snapshot.queryKey, snapshot.data);
}

export function restoreSnapshots(
	queryClient: QueryClient,
	snapshots: Array<OptimisticSnapshot<unknown>> = [],
) {
	snapshots.forEach((snapshot) => {
		queryClient.setQueryData(snapshot.queryKey, snapshot.data);
	});
}

import { feedKeys } from '@features/feed/api/keys';
import type { QueryClient } from '@tanstack/react-query';

const homeFeedKey = ['home-feed'] as const;

export async function clearFeedSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [feedKeys.all(), homeFeedKey];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

import { poemKeys } from '@features/poems/api/keys';
import type { QueryClient } from '@tanstack/react-query';

export async function clearPoemSessionQueries(queryClient: QueryClient): Promise<void> {
	const keysToClear = [poemKeys.mine(), poemKeys.saved(), poemKeys.collections()];

	await Promise.all(
		keysToClear.map(async (key) => {
			await queryClient.cancelQueries({ queryKey: key });
			queryClient.removeQueries({ queryKey: key });
		}),
	);
}

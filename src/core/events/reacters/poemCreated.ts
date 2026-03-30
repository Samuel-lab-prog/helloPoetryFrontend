import type { QueryClient } from '@tanstack/react-query';
import type { AppEvents } from '../eventBus';

export async function onPoemCreated(
	queryClient: QueryClient,
	_payload: AppEvents['poemCreated'],
): Promise<void> {
	await Promise.all([
		queryClient.invalidateQueries({ queryKey: ['poems'] }),
		queryClient.invalidateQueries({ queryKey: ['poems-minimal'] }),
		queryClient.invalidateQueries({ queryKey: ['feed'] }),
	]);
}

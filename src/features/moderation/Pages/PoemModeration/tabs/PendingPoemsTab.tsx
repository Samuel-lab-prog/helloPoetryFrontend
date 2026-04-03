import { AsyncState } from '@BaseComponents';
import { Flex, Spinner, Tabs, Text, VStack } from '@chakra-ui/react';
import type { ModeratePoemBody, ModerationPoem } from '@features/moderation/api/types';
import type { AppErrorType } from '@Utils';

import { ModerationPoemCard } from '../PoemModerationCard';

type Props = {
	pendingQuery: {
		isLoading: boolean;
		isError: boolean;
		error: unknown;
	};
	pendingPoems: ModerationPoem[];
	isModerating: boolean;
	onModerate: (poemId: number, status: ModeratePoemBody['moderationStatus']) => void;
};
export function AnalyzeTab({ pendingQuery, pendingPoems, isModerating, onModerate }: Props) {
	function formatError(err: unknown) {
		const appError = err as AppErrorType | null;
		if (!appError) return 'Error loading pending poems.';
		if (appError.statusCode === 403) return 'Restricted access for moderation.';
		return appError.message ?? 'Error loading pending poems.';
	}

	return (
		<Tabs.Content value='pending'>
			<AsyncState
				isLoading={pendingQuery.isLoading}
				isError={pendingQuery.isError}
				isEmpty={!pendingPoems.length}
				loadingElement={
					<Flex justify='center' py={12}>
						<Spinner size='lg' color='pink.300' />
					</Flex>
				}
				errorElement={
					<Text textStyle='body' color='pink.200'>
						{formatError(pendingQuery.error)}
					</Text>
				}
				emptyElement={
					<Text textStyle='body' color='pink.100' textAlign='center'>
						No pending poems at the moment.
					</Text>
				}
			>
				<VStack align='stretch' gap={6}>
					{pendingPoems.map((poem) => (
						<ModerationPoemCard
							key={poem.id}
							poem={poem}
							isPending={isModerating}
							onModerate={onModerate}
						/>
					))}
				</VStack>
			</AsyncState>
		</Tabs.Content>
	);
}

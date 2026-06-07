import type { ModeratePoemBody, ModerationPoem } from '@Api/moderation/types';
import { AsyncState } from '@BaseComponents';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import type { AppErrorType } from '@Utils';

import { ModerationPoemCard } from './PoemModerationCard';

type Props = {
	pendingQuery: {
		isLoading: boolean;
		isError: boolean;
		error: unknown;
	};
	pendingPoems: ModerationPoem[];
	isModeratingPoem: (poemId: number) => boolean;
	isRemovingPoem: (poemId: number) => boolean;
	onModerate: (poemId: number, status: ModeratePoemBody['moderationStatus']) => void;
};
export function AnalyzeTab({
	pendingQuery,
	pendingPoems,
	isModeratingPoem,
	isRemovingPoem,
	onModerate,
}: Props) {
	function formatError(err: unknown) {
		const appError = err as AppErrorType | null;
		if (!appError) return 'Error loading pending poems.';
		if (appError.statusCode === 403) return 'Restricted access for moderation.';
		return appError.message ?? 'Error loading pending poems.';
	}

	return (
		<AsyncState
			isLoading={pendingQuery.isLoading}
			isError={pendingQuery.isError}
			isEmpty={!pendingPoems.length}
			loadingElement={
				<Flex justify='center' py={8}>
					<Spinner size='md' color='pink.300' />
				</Flex>
			}
			errorElement={
				<Text textStyle='small' color='pink.200'>
					{formatError(pendingQuery.error)}
				</Text>
			}
			emptyElement={
				<Text textStyle='small' color='pink.100' textAlign='center'>
					No pending poems at the moment.
				</Text>
			}
		>
			<VStack align='stretch' gap={5} mb={4}>
				{pendingPoems.map((poem) => (
					<ModerationPoemCard
						key={poem.id}
						poem={poem}
						isPending={isModeratingPoem(poem.id)}
						isRemoving={isRemovingPoem(poem.id)}
						onModerate={onModerate}
					/>
				))}
			</VStack>
		</AsyncState>
	);
}

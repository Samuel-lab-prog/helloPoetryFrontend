import type { ModeratePoemBody, ModerationPoem } from '@Api/moderation/types';
import { AsyncState } from '@BaseComponents';
import { Box, Flex, Heading, HStack, Icon, Spinner, Text, VStack } from '@chakra-ui/react';
import {
	getAccessDeniedMessage,
	getBannedPrivilegeMessage,
	isBannedAccessError,
} from '@features/auth/public';
import type { AppErrorType } from '@Utils';
import { Hourglass } from 'lucide-react';

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
	onModerate: (
		poemId: number,
		status: ModeratePoemBody['moderationStatus'],
		reason?: string,
	) => void;
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
		if (appError.statusCode === 401 && isBannedAccessError(appError)) {
			return getBannedPrivilegeMessage('review pending poems');
		}
		if (appError.statusCode === 403) {
			return getAccessDeniedMessage({
				fallback: 'Restricted access for moderation.',
				suspendedAction: 'review pending poems',
			});
		}
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
				<Box mt={4}>
					<Box
						w='full'
						role='status'
						aria-live='polite'
						position='relative'
						overflow='hidden'
						borderRadius='2xl'
						border='1px solid'
						borderColor='purple.700'
						bgGradient='linear(to-br, rgba(42, 21, 57, 0.92), rgba(30, 20, 46, 0.98) 55%, rgba(25, 31, 58, 0.96))'
						p={{ base: 5, md: 6 }}
						shadow='0 12px 30px rgba(0,0,0,0.28)'
						_before={{
							content: '""',
							position: 'absolute',
							inset: '-40px auto auto -30px',
							w: '180px',
							h: '180px',
							borderRadius: 'full',
							bg: 'pink.500',
							filter: 'blur(70px)',
							opacity: 0.14,
						}}
						_after={{
							content: '""',
							position: 'absolute',
							inset: 'auto -50px -60px auto',
							w: '200px',
							h: '200px',
							borderRadius: 'full',
							bg: 'purple.500',
							filter: 'blur(75px)',
							opacity: 0.18,
						}}
					>
						<VStack align='start' gap={4} position='relative' zIndex={1}>
							<HStack
								px={3}
								py={2}
								borderRadius='full'
								bg='rgba(255, 255, 255, 0.06)'
								border='1px solid'
								borderColor='rgba(255, 255, 255, 0.08)'
								gap={2}
							>
								<Icon as={Hourglass} boxSize={4.5} color='pink.200' />
								<Text
									textStyle='smaller'
									color='pink.200'
									letterSpacing='0.08em'
									textTransform='uppercase'
								>
									No pending poems
								</Text>
							</HStack>

							<VStack align='start' gap={2} maxW='md'>
								<Heading as='h2' textStyle='h4' color='white' mb={0}>
									Nothing to review right now
								</Heading>
								<Text textStyle='smaller' color='pink.100'>
									New poems will appear here when they are submitted for moderation. For now, the
									queue is empty and everything is up to date.
								</Text>
							</VStack>
						</VStack>
					</Box>
				</Box>
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

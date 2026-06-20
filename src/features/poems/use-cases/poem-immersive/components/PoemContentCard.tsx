import { AsyncState, ErrorStateCard } from '@BaseComponents';
import { Box, Text } from '@chakra-ui/react';
import { isBannedAccessError } from '@features/auth/public';
import { LoadingPoemSkeleton } from '@features/poems/public/components/LoadingPoemSkeleton';

import { getPoemErrorInfo } from '../../poem/utils/getPoemErrorInfo';
import { type DedicationUser, type Poem } from '../utils/types';
import { PoemContent } from './PoemContent';
import { PoemDedication } from './PoemDedication';
import { PoemHeader } from './PoemHeader';

interface PoemContentCardProps {
	poem: Poem | null | undefined;
	isLoading: boolean;
	isError: boolean;
	error?: unknown;
	dedicationUsers: DedicationUser[];
}

export function PoemContentCard({
	poem,
	isLoading,
	isError,
	error,
	dedicationUsers,
}: PoemContentCardProps) {
	const poemErrorInfo = getPoemErrorInfo(error);
	const isBannedPoemError = isBannedAccessError(error);

	return (
		<AsyncState
			isLoading={isLoading}
			isError={isError}
			isEmpty={!poem}
			emptyElement={<Text textStyle='small'>Poem not found.</Text>}
			errorElement={
				<ErrorStateCard
					eyebrow={poemErrorInfo.eyebrow}
					title={poemErrorInfo.title}
					description={poemErrorInfo.description}
					actionLabel={isBannedPoemError ? undefined : 'Refresh poem'}
					onAction={isBannedPoemError ? undefined : () => window.location.reload()}
				/>
			}
			loadingElement={<LoadingPoemSkeleton variant='immersive' />}
		>
			{poem && (
				<Box w='full'>
					<PoemHeader title={poem.title} authorName={poem.author.name} />
					<Box
						bg='rgba(255,255,255,0.04)'
						border='1px solid'
						borderColor='purple.700'
						borderRadius='2xl'
						p={{ base: 5, md: 8 }}
						boxShadow='0 30px 80px rgba(0,0,0,0.45)'
						display='flex'
						justifyContent='flex-start'
						position='relative'
						w='full'
					>
						<PoemContent content={poem.content} />
						<PoemDedication dedicationUsers={dedicationUsers} />
					</Box>
				</Box>
			)}
		</AsyncState>
	);
}

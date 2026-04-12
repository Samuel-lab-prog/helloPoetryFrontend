import { AsyncState } from '@BaseComponents';
import { Box, Text } from '@chakra-ui/react';

import { type DedicationUser, type Poem } from '../utils/types';
import { PoemContent } from './PoemContent';
import { PoemDedication } from './PoemDedication';
import { PoemHeader } from './PoemHeader';

interface PoemContentCardProps {
	poem: Poem | null | undefined;
	isLoading: boolean;
	isError: boolean;
	dedicationUsers: DedicationUser[];
}

export function PoemContentCard({
	poem,
	isLoading,
	isError,
	dedicationUsers,
}: PoemContentCardProps) {
	return (
		<AsyncState
			isLoading={isLoading}
			isError={isError}
			isEmpty={!poem}
			emptyElement={<Text textStyle='body'>Poem not found.</Text>}
			errorElement={<Text textStyle='body'>Error loading the poem. Please try again.</Text>}
			loadingElement={<Text textStyle='body'>Loading poem...</Text>}
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
						justifyContent='center'
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

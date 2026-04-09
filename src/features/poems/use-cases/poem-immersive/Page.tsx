import { Box, Flex, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { usePoem } from '../poem/hooks/usePoem';
import { PoemBackLink } from './components/PoemBackLink';
import { PoemContentCard } from './components/PoemContentCard';
import { parsePoemId, useDedicationUsers } from './utils/utils';

export function PoemImmersivePage() {
	const { id } = useParams<{ id: string }>();
	const poemId = useMemo(() => parsePoemId(id), [id]);
	const { poem, isError, isLoading } = usePoem(poemId);
	const dedicationUsers = useDedicationUsers(poem);

	if (poemId <= 0) {
		return (
			<Flex as='main' minH='100vh' align='center' justify='center' p={6}>
				<Text textStyle='body'>Invalid poem ID.</Text>
			</Flex>
		);
	}

	return (
		<Box
			as='main'
			minH='100vh'
			bg='radial-gradient(circle at top, rgba(255,255,255,0.08) 0%, rgba(16,10,20,0.95) 55%, rgba(6,4,8,1) 100%)'
			color='pink.50'
			py={{ base: 12, md: 16 }}
			px={{ base: 4, md: 8 }}
		>
			<Flex direction='column' align='center'>
				<Box w='full' maxW='2xl'>
					<PoemBackLink poemId={poemId} poemSlug={poem?.slug} />
					<PoemContentCard
						poem={poem}
						isLoading={isLoading}
						isError={!!isError}
						dedicationUsers={dedicationUsers}
					/>
				</Box>
			</Flex>
		</Box>
	);
}

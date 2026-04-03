import { Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingAuthorPoemsSkeletons = (
	<Flex direction='column' gap={3}>
		{Array.from({ length: 6 }).map((_, index) => (
			<Box
				key={`author-poem-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				w='full'
				pt={2}
				pb={1}
				_first={{ borderTop: 'none' }}
			>
				<Flex align='center' justify='space-between' gap={2}>
					<Flex direction='column' gap={2} w='full'>
						<Skeleton height='12px' width='70%' />
						<Skeleton height='10px' width='120px' />
					</Flex>
					<Skeleton height='10px' width='40px' />
				</Flex>
			</Box>
		))}
	</Flex>
);

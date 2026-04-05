import { Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingPoemsSkeletons = (
	<Flex direction='column' gap={2}>
		{Array.from({ length: 6 }).map((_, index) => (
			<Box
				key={`feed-poem-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				_first={{ borderTop: 'none' }}
				p={4}
			>
				<Flex direction='column' gap={3}>
					<Skeleton height='14px' width='40px' borderRadius='full' />
					<Skeleton height='20px' width='70%' />
					<Skeleton height='12px' width='90%' />
					<Skeleton height='12px' width='80%' />
					<Flex align='center' gap={3}>
						<Skeleton height='12px' width='80px' />
						<Skeleton height='12px' width='60px' />
						<Skeleton height='12px' width='90px' />
					</Flex>
				</Flex>
			</Box>
		))}
	</Flex>
);

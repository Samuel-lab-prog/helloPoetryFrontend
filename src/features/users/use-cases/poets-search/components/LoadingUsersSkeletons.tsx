import { Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingUsersSkeletons = (
	<Flex direction='column' gap={3} w='full' px={4}>
		{Array.from({ length: 4 }).map((_, index) => (
			<Box
				key={`poet-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				w='full'
				pt={2}
				pb={1}
				_first={{ borderTop: 'none' }}
			>
				<Flex align='center' gap={3}>
					<Skeleton boxSize='12' borderRadius='full' />
					<Flex direction='column' gap={2}>
						<Skeleton height='12px' width='160px' />
						<Skeleton height='12px' width='110px' />
					</Flex>
				</Flex>
			</Box>
		))}
	</Flex>
);

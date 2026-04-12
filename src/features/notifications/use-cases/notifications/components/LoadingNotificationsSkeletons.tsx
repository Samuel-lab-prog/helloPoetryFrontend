import { Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingNotificationsSkeletons = (
	<Flex direction='column' gap={1}>
		{Array.from({ length: 5 }).map((_, index) => (
			<Box
				key={`notification-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				_first={{ borderTop: 'none' }}
				p={4}
			>
				<Flex align='center' gap={3}>
					<Skeleton boxSize='12' borderRadius='full' />
					<Flex direction='column' gap={2} flex='1'>
						<Skeleton height='12px' width='70%' />
						<Skeleton height='12px' width='90%' />
						<Skeleton height='10px' width='40%' />
					</Flex>
				</Flex>
			</Box>
		))}
	</Flex>
);

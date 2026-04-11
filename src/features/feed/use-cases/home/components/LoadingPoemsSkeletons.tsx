import { Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingPoemsSkeletons = (
	<Flex direction='column' gap={2}>
		{Array.from({ length: 6 }).map((_, index) => (
			<Box
				key={`feed-poem-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				_first={{ borderTop: 'none' }}
				pt={3}
			>
				<Box px={4} py={5} borderRadius='lg'>
					<Flex direction='column' gap={3}>
						<Skeleton height='22px' width='75%' />
						<Flex direction='column' gap={2}>
							<Skeleton height='12px' width='92%' />
							<Skeleton height='12px' width='88%' />
						</Flex>
						<Flex align='center' gap={2}>
							<Skeleton height='40px' width='40px' borderRadius='full' />
							<Flex direction='column' gap={2} flex='1'>
								<Skeleton height='12px' width='45%' />
								<Skeleton height='10px' width='35%' />
							</Flex>
						</Flex>
						<Flex gap={2} wrap='wrap'>
							<Skeleton height='18px' width='64px' borderRadius='full' />
							<Skeleton height='18px' width='72px' borderRadius='full' />
							<Skeleton height='18px' width='56px' borderRadius='full' />
						</Flex>
					</Flex>
				</Box>
			</Box>
		))}
	</Flex>
);

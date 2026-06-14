import { Avatar, Box, Flex, Skeleton } from '@chakra-ui/react';

export const LoadingUsersSkeletons = (
	<Flex direction='column' gap={3} w='full' px={4}>
		{Array.from({ length: 4 }).map((_, index) => (
			<Box
				key={`poet-skeleton-${index}`}
				borderTop='1px solid'
				borderColor='purple.700'
				w='full'
				pt={0}
				px={{ base: 3.5, md: 4 }}
				py={{ base: 2.5, md: 3 }}
				_first={{ borderTop: 'none' }}
			>
				<Flex align='center' gap={3}>
					<Flex align='center' gap={3} minW={0} flex='1'>
						<Avatar.Root size={{ base: 'xs', md: 'md' }}>
							<Skeleton height='100%' width='100%' borderRadius='full' />
						</Avatar.Root>
						<Flex direction='column' gap={1} minW={0} flex='1'>
							<Skeleton height='12px' width='60%' maxW='160px' borderRadius='md' />
							<Skeleton height='12px' width='42%' maxW='110px' borderRadius='md' />
						</Flex>
					</Flex>
				</Flex>
			</Box>
		))}
	</Flex>
);

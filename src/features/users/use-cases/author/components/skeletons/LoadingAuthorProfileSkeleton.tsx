import { Flex, Skeleton } from '@chakra-ui/react';

export const LoadingAuthorProfileSkeleton = (
	<Flex
		p={5}
		border='1px solid'
		borderColor='purple.700'
		borderRadius='xl'
		bg='rgba(255, 255, 255, 0.02)'
		backdropFilter='blur(4px)'
		gap={4}
		align={{ base: 'start', md: 'center' }}
		direction={{ base: 'column', md: 'row' }}
	>
		<Skeleton boxSize={{ base: '4.75rem', md: '6rem' }} borderRadius='full' />
		<Flex direction='column' gap={1.5} w='full'>
			<Skeleton height='20px' width='180px' />
			<Skeleton height='14px' width='120px' />
			<Skeleton height='12px' width='240px' />
			<Skeleton height='12px' width='180px' />
			<Flex mt={1} direction='column' gap={1.5} align='start'>
				<Flex align='center' gap={2}>
					<Skeleton boxSize='16px' borderRadius='full' />
					<Skeleton height='12px' width='140px' />
				</Flex>
				<Skeleton height='26px' width='140px' borderRadius='md' />
			</Flex>
		</Flex>
	</Flex>
);

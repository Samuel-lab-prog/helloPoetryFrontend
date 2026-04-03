import { Flex, Skeleton } from '@chakra-ui/react';

export const LoadingAuthorProfileSkeleton = (
	<Flex
		p={6}
		border='1px solid'
		borderColor='purple.700'
		borderRadius='xl'
		bg='rgba(255, 255, 255, 0.02)'
		backdropFilter='blur(4px)'
		gap={6}
		align={{ base: 'start', md: 'center' }}
		direction={{ base: 'column', md: 'row' }}
	>
		<Skeleton boxSize={{ base: '6rem', md: '8rem' }} borderRadius='full' />
		<Flex direction='column' gap={2} w='full'>
			<Skeleton height='22px' width='220px' />
			<Skeleton height='14px' width='120px' />
			<Skeleton height='12px' width='280px' />
			<Skeleton height='12px' width='200px' />
			<Flex mt={2} direction='column' gap={2} align='start'>
				<Flex align='center' gap={2}>
					<Skeleton boxSize='16px' borderRadius='full' />
					<Skeleton height='12px' width='160px' />
				</Flex>
				<Skeleton height='28px' width='160px' borderRadius='md' />
			</Flex>
		</Flex>
	</Flex>
);

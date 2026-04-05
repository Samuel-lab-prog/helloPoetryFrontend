import { Flex, type FlexProps } from '@chakra-ui/react';

export function FormCard(props: FlexProps) {
	return (
		<Flex
			direction='column'
			align='center'
			gap={1}
			p={2}
			w='full'
			maxW='md'
			border='1px solid'
			borderColor='purple.700'
			borderRadius='xl'
			bg='rgba(255, 255, 255, 0.02)'
			backdropFilter='blur(4px)'
			transition='background-color 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease'
			_hover={{
				borderColor: 'purple.500',
				bg: 'rgba(255, 255, 255, 0.04)',
			}}
			_focusWithin={{
				borderColor: 'pink.400',
				bg: 'rgba(255, 255, 255, 0.06)',
				boxShadow: '0 10px 28px rgba(58, 33, 56, 0.35)',
			}}
			animationName='fade-in'
			animationDuration='420ms'
			animationTimingFunction='ease-out'
			{...props}
		/>
	);
}

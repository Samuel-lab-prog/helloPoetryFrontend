import { Box, type BoxProps } from '@chakra-ui/react';

interface FieldContainerProps extends BoxProps {
	delay?: number;
	hasError?: boolean;
}

export function FieldContainer({
	children,
	delay = 0,
	hasError = false,
	...props
}: FieldContainerProps) {
	return (
		<Box
			w='full'
			p='1'
			border='1px solid'
			borderColor={hasError ? 'error' : 'transparent'}
			bg={hasError ? 'rgba(248, 113, 113, 0.08)' : 'transparent'}
			borderRadius='md'
			transition='border-color 0.22s ease, background-color 0.22s ease, box-shadow 0.22s ease'
			_focusWithin={{
				borderColor: hasError ? 'error' : 'pink.300',
				bg: hasError
					? 'rgba(248, 113, 113, 0.08)'
					: 'rgba(255, 143, 189, 0.06)',
			}}
			animationName='slide-from-bottom, fade-in'
			animationDuration='380ms'
			animationTimingFunction='ease-out'
			animationFillMode='backwards'
			animationDelay={`${delay}ms`}
			{...props}
		>
			{children}
		</Box>
	);
}

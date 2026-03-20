import { Button as ChakraButton, type ButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export type BaseButtonProps = ButtonProps & {
	loading?: boolean;
	fullWidth?: boolean;
};

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
	({ loading, fullWidth, w, ...props }, ref) => (
		<ChakraButton ref={ref} loading={loading} w={fullWidth ? 'full' : w} {...props} />
	),
);

BaseButton.displayName = 'BaseButton';

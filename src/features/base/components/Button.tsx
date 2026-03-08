import { forwardRef } from 'react';
import { Button as ChakraButton, type ButtonProps } from '@chakra-ui/react';

export interface BaseButtonProps extends ButtonProps {
	isLoading?: boolean;
	isDisabled?: boolean;
	fullWidth?: boolean;
	disableWhenLoading?: boolean;
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(function BaseButton(
	{
		children,
		variant = 'surface',
		size = 'md',
		loading,
		isLoading,
		disabled,
		isDisabled,
		fullWidth,
		disableWhenLoading = true,
		w,
		...props
	},
	ref,
) {
	const resolvedLoading = loading ?? isLoading ?? false;
	const resolvedDisabled = disabled ?? isDisabled ?? (disableWhenLoading ? resolvedLoading : false);

	return (
		<ChakraButton
			ref={ref}
			variant={variant}
			size={size}
			loading={resolvedLoading}
			disabled={resolvedDisabled}
			w={fullWidth ? 'full' : w}
			{...props}
		>
			{children}
		</ChakraButton>
	);
});

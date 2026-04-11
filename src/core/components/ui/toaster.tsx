'use client';

import {
	createToaster,
	Portal,
	Spinner,
	Stack,
	Toast,
	Toaster as ChakraToaster,
} from '@chakra-ui/react';

// eslint-disable-next-line react-refresh/only-export-components
export const toaster = createToaster({
	placement: 'bottom-end',
	pauseOnPageIdle: true,
});

export const Toaster = () => (
	<Portal>
		<ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
			{(toast) => {
				const colorPalette = (toast.meta as { colorPalette?: string } | undefined)?.colorPalette;
				return (
					<Toast.Root
						width={{ md: 'sm' }}
						colorPalette={colorPalette}
						bg={colorPalette ? `${colorPalette}.600` : undefined}
						borderColor={colorPalette ? `${colorPalette}.400` : undefined}
						color={colorPalette ? `${colorPalette}.50` : undefined}
					>
						{toast.type === 'loading' ? (
							<Spinner size='sm' color='blue.solid' />
						) : (
							<Toast.Indicator />
						)}
						<Stack gap='1' flex='1' maxWidth='100%'>
							{toast.title && <Toast.Title>{toast.title}</Toast.Title>}
							{toast.description && <Toast.Description>{toast.description}</Toast.Description>}
						</Stack>
						{toast.action && <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>}
						{toast.closable && <Toast.CloseTrigger />}
					</Toast.Root>
				);
			}}
		</ChakraToaster>
	</Portal>
);

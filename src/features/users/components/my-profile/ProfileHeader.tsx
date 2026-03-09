import { Button, Flex, Heading } from '@chakra-ui/react';

type ProfileHeaderProps = {
	isLoggingOut: boolean;
	onLogout: () => void;
};

export function ProfileHeader({ isLoggingOut, onLogout }: ProfileHeaderProps) {
	return (
		<Flex
			mb={8}
			align={{ base: 'start', md: 'center' }}
			justify='space-between'
			direction={{ base: 'column', md: 'row' }}
			gap={3}
		>
			<Heading as='h1' textStyle='h2'>
				Meu Perfil
			</Heading>
			<Button
				size={{ base: 'sm', md: 'md' }}
				variant='solidPink'
				loading={isLoggingOut}
				onClick={onLogout}
			>
				Sair
			</Button>
		</Flex>
	);
}

import { ErrorStateCard } from '@BaseComponents';
import { type BoxProps,Button, HStack, Icon, Text } from '@chakra-ui/react';
import { LogIn, UserPlus } from 'lucide-react';
import { NavLink } from 'react-router-dom';

type AuthRequiredCardProps = Omit<BoxProps, 'title'> & {
	eyebrow?: string;
	title: string;
	description: string;
	showCreateAccount?: boolean;
};

export function AuthRequiredCard({
	eyebrow = 'SIGN IN REQUIRED',
	title,
	description,
	showCreateAccount = true,
	...boxProps
}: AuthRequiredCardProps) {
	return (
		<ErrorStateCard
			eyebrow={eyebrow}
			title={title}
			description={description}
			action={
				<HStack gap={3} wrap='wrap' w='full'>
					<Button size='sm' variant='solidPink' w={{ base: 'full', md: 'auto' }} asChild>
						<NavLink to='/login'>
							<HStack gap={2}>
								<Icon as={LogIn} boxSize={3.5} />
								<Text as='span'>Sign in</Text>
							</HStack>
						</NavLink>
					</Button>
					{showCreateAccount ? (
						<Button
							size='sm'
							variant='solidPink'
							colorPalette='gray'
							w={{ base: 'full', md: 'auto' }}
							asChild
						>
							<NavLink to='/register'>
								<HStack gap={2}>
									<Icon as={UserPlus} boxSize={3.5} />
									<Text as='span'>Create account</Text>
								</HStack>
							</NavLink>
						</Button>
					) : null}
				</HStack>
			}
			{...boxProps}
		/>
	);
}

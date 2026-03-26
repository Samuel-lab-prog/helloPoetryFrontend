import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthClientStore } from '@root/core/stores/useAuthClientStore';
import { useMyPoems } from '@root/features/poems/public/hooks/useGetMyPoems';
import { ProfileAccessGate } from '../components/my-profile/ProfileAccessGate';
import { MyPoemsSection } from '../components/my-profile/MyPoemsSection';

export function MyProfilePoemsPage() {
	const navigate = useNavigate();
	const authClient = useAuthClientStore((state) => state.authClient);
	const {
		poems: myPoems,
		isLoading: isLoadingMyPoems,
		isError: isMyPoemsError,
	} = useMyPoems(Boolean(authClient?.id));

	if (!authClient?.id) {
		return (
			<Flex as='main' layerStyle='main' direction='column' align='center'>
				<ProfileAccessGate />
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='main' direction='column' align='center'>
			<Box as='section' w='full' maxW='5xl'>
				<Flex
					mb={8}
					align={{ base: 'start', md: 'center' }}
					justify='space-between'
					direction={{ base: 'column', md: 'row' }}
					gap={3}
				>
					<Heading as='h1' textStyle='h2'>
						All my poems
					</Heading>
					<Button size={{ base: 'sm', md: 'md' }} variant='solidPink' colorPalette='gray' asChild>
						<NavLink to='/my-profile'>Back to profile</NavLink>
					</Button>
				</Flex>

				<MyPoemsSection
					myPoems={myPoems}
					isLoadingMyPoems={isLoadingMyPoems}
					isMyPoemsError={isMyPoemsError}
					onOpenPoem={(slug, id) => navigate(`/poems/${slug}/${id}`)}
					onUpdatePoem={(id) => navigate(`/admin?mode=update&poemId=${id}`)}
					onDeletePoem={(id) => navigate(`/admin?mode=delete&poemId=${id}`)}
				/>
			</Box>
		</Flex>
	);
}

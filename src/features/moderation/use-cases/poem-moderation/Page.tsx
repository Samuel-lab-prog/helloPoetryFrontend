import { Surface } from '@BaseComponents';
import { Flex, Heading, Tabs, Text } from '@chakra-ui/react';
import { useEnsureRole } from '@features/auth/public/hooks/useEnsureRole';
import { useNavigate } from 'react-router-dom';

import { ActionsTab } from './components/ActionsTab';
import { AnalyzeTab } from './components/PendingPoemsTab';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { usePoemModerationData } from './hooks/usePoemModerationData';

export function PoemModerationPage() {
	const navigate = useNavigate();
	const canAccess = useEnsureRole(['moderator', 'admin']);

	const { pendingQuery, pendingPoems, isModeratingPoem, isRemovingPoem, handleModeration } =
		usePoemModerationData(canAccess);

	type Tab = {
		value: string;
		label: string;
	};

	const tabs: Tab[] = [
		{ value: 'pending', label: 'Pending poems' },
		{ value: 'actions', label: 'Administrative actions' },
	];

	if (!canAccess) return <UnauthorizedPage onBack={() => navigate('/')} />;

	function PageHeader() {
		return (
			<Flex as='section' direction='column' align='center' textAlign='center' gap={2}>
				<Heading as='h1' textStyle='h3' mb={0}>
					Poem moderation
				</Heading>
				<Text textStyle='small' color='pink.200' maxW='2xl' mb={2}>
					Review pending poems, then switch to the administrative tools when you need to take
					action.
				</Text>
			</Flex>
		);
	}

	return (
		<Flex
			as='main'
			layerStyle='mainPadded'
			direction='column'
			align='center'
			w='full'
			maxW='4xl'
			mx='auto'
			flex='1'
			overflowY='auto'
			scrollbarGutter='stable'
		>
			<PageHeader />

			<Tabs.Root variant='plain' colorPalette='pink' defaultValue='pending' w='full'>
				<Surface variant='gradient' w='full' maxW='3xl' mx='auto'>
					<Flex direction='column' gap={4}>
						<Tabs.List
							display='flex'
							flexWrap='wrap'
							gap={2}
							w='full'
							justifyContent='stretch'
						>
							{tabs.map((tab) => (
								<Tabs.Trigger
									key={tab.value}
									value={tab.value}
									flex='1 1 220px'
									minH='12'
									px={4}
									py={3}
									border='1px solid'
									borderColor='purple.700'
									borderRadius='lg'
									bg='rgba(255, 255, 255, 0.03)'
									color='pink.200'
									textStyle='small'
									fontWeight='semibold'
									transition='transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
									_hover={{
										bg: 'rgba(255, 255, 255, 0.06)',
										borderColor: 'pink.400',
										color: 'pink.100',
										transform: 'translateY(-1px)',
									}}
									_selected={{
										bg: 'linear-gradient(135deg, rgba(255, 143, 189, 0.22), rgba(240, 68, 142, 0.28))',
										borderColor: 'pink.400',
										color: 'white',
										boxShadow: '0 10px 22px rgba(58, 33, 56, 0.28)',
									}}
								>
									{tab.label}
								</Tabs.Trigger>
							))}
						</Tabs.List>
					</Flex>
				</Surface>

				<Flex direction='column' gap={6} mb={4} w='full'>
					<AnalyzeTab
						pendingQuery={pendingQuery}
						pendingPoems={pendingPoems}
						isModeratingPoem={isModeratingPoem}
						isRemovingPoem={isRemovingPoem}
						onModerate={handleModeration}
					/>
					<ActionsTab />
				</Flex>
			</Tabs.Root>
		</Flex>
	);
}

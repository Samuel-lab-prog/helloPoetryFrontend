import { Flex, Heading, Tabs, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { UnauthorizedPage } from './UnauthorizedModPage';
import { AnalyzeTab } from './tabs/PendingPoemsTab';
import { ActionsTab } from './tabs/ActionsTab';
import { usePoemModerationData } from './hooks';
import { useEnsureRole } from '@root/core/hooks/useIsModerator';

export function PoemModerationPage() {
	const navigate = useNavigate();
	const canAccess = useEnsureRole(['moderator', 'admin']);

	const { pendingQuery, pendingPoems, isModerating, handleModeration } =
		usePoemModerationData(canAccess);

	type Tab = {
		value: string;
		label: string;
	}

	const tabs: Tab[] = [
		{ value: 'pending', label: 'Poemas pendentes' },
		{ value: 'actions', label: 'Ações administrativas' },
	];

	if (!canAccess)
		return <UnauthorizedPage onBack={() => navigate('/')} />;

	function PageHeader() {
		return (
			<Flex as='section' direction='column' align='center' textAlign='center'>
				<Heading as='h1' textStyle='h2' mb={2}>
					Moderação de poemas
				</Heading>
				<Text textStyle='body' color='pink.100'>
					Analise os poemas pendentes e mantenha a comunidade saudável e acolhedora.
				</Text>
			</Flex>
		)
	}

	return (
		<Flex
			as='main'
			layerStyle='main'
			direction='column'
			gap={8}
			w={{ base: 'full', md: '4xl' }}
			mx='auto'
			px={{ base: 4, md: 0 }}
		>
			<PageHeader />

			<Tabs.Root variant='enclosed' colorPalette='pink' defaultValue='pending'>
				<Tabs.List colorPalette={'pink'}>
					{tabs.map((tab) => (
						<Tabs.Trigger
							key={tab.value}
							value={tab.value}
						>
							{tab.label}
						</Tabs.Trigger>
					))}
				</Tabs.List>

				<AnalyzeTab
					pendingQuery={pendingQuery}
					pendingPoems={pendingPoems}
					isModerating={isModerating}
					onModerate={handleModeration}
				/>
				<ActionsTab />
			</Tabs.Root>
		</Flex>
	);
}

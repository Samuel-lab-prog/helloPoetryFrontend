import { Flex, Heading, Tabs } from '@chakra-ui/react';
import { useEnsureRole } from '@features/auth/public/hooks/useEnsureRole';
import { useNavigate } from 'react-router-dom';

import { ActionsTab } from './components/ActionsTab';
import { AnalyzeTab } from './components/PendingPoemsTab';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { usePoemModerationData } from './hooks/usePoemModerationData';

export function PoemModerationPage() {
	const navigate = useNavigate();
	const canAccess = useEnsureRole(['moderator', 'admin']);

	const { pendingQuery, pendingPoems, isModerating, handleModeration } =
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
			<Flex as='section' direction='column' align='center' textAlign='center'>
				<Heading as='h1' textStyle='h2' mb={2}>
					Poem moderation
				</Heading>
			</Flex>
		);
	}

	return (
		<Flex as='main' layerStyle='mainPadded' direction='column' align='stretch' gap={8} w='full'>
			<PageHeader />

			<Tabs.Root variant='enclosed' colorPalette='pink' defaultValue='pending'>
				<Tabs.List colorPalette='pink' flexWrap='wrap' gap={2}>
					{tabs.map((tab) => (
						<Tabs.Trigger key={tab.value} value={tab.value}>
							{tab.label}
						</Tabs.Trigger>
					))}
				</Tabs.List>

				<Flex direction='column' gap={6} mt={6}>
					<AnalyzeTab
						pendingQuery={pendingQuery}
						pendingPoems={pendingPoems}
						isModerating={isModerating}
						onModerate={handleModeration}
					/>
					<ActionsTab />
				</Flex>
			</Tabs.Root>
		</Flex>
	);
}

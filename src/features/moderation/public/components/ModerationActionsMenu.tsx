import { moderation } from '@Api/moderation/endpoints';
import {
	Box,
	HStack,
	Icon,
	IconButton,
	type IconButtonProps,
	Menu,
	Portal,
	Text,
} from '@chakra-ui/react';
import { useAuthClientStore } from '@features/auth/public/stores/useAuthClientStore';
import { useQuery } from '@tanstack/react-query';
import {
	Ban,
	Check,
	Clock3,
	EllipsisVertical,
	LoaderCircle,
	type LucideIcon,
	RotateCcw,
	Trash2,
	X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useModerationActions } from '../hooks/useModerationActions';
import type {
	ModerationAction,
	ModerationActionCompletePayload,
	ModerationTargetPoem,
	ModerationTargetUser,
} from '../types';
import { moderationActionConfig } from '../utils/actionConfig';
import { canModeratePoemTarget, canModerateUserTarget } from '../utils/canModerateTarget';
import { ModerationActionDialog } from './ModerationActionDialog';

type ModerationActionsMenuProps = {
	poem?: ModerationTargetPoem;
	user?: ModerationTargetUser;
	ariaLabel?: string;
	size?: IconButtonProps['size'];
	variant?: IconButtonProps['variant'];
	onActionComplete?: (payload: ModerationActionCompletePayload) => void;
};

type ActionItem = {
	action: ModerationAction;
	icon: LucideIcon;
};

const POEM_ACTIONS: ActionItem[] = [
	{ action: 'approve-poem', icon: Check },
	{ action: 'reject-poem', icon: X },
	{ action: 'remove-poem', icon: Trash2 },
];

function shouldShowPoemAction(action: ModerationAction, poem?: ModerationTargetPoem) {
	if (!poem) return false;
	const moderationStatus = poem.moderationStatus;
	if (action === 'approve-poem') return moderationStatus === 'pending' || moderationStatus === 'rejected';
	if (action === 'reject-poem') return moderationStatus === 'pending';
	if (action === 'remove-poem') return moderationStatus !== 'removed';
	return false;
}

function ActionMenuItem({
	item,
	onSelect,
}: {
	item: ActionItem;
	onSelect: (action: ModerationAction) => void;
}) {
	const config = moderationActionConfig[item.action];

	return (
		<Menu.Item
			value={item.action}
			color='pink.100'
			_hover={{ bg: 'rgba(255, 255, 255, 0.06)' }}
			onClick={(event) => {
				event.stopPropagation();
				onSelect(item.action);
			}}
		>
			<HStack gap={2}>
				<Icon as={item.icon} boxSize={4} color={config.tone === 'danger' ? 'red.300' : 'pink.200'} />
				<Text as='span' textStyle='small'>
					{config.label}
				</Text>
			</HStack>
		</Menu.Item>
	);
}

function LoadingSanctionsItem() {
	return (
		<Menu.Item value='checking-sanctions' color='pink.200' disabled>
			<HStack gap={2}>
				<Icon as={LoaderCircle} boxSize={4} />
				<Text as='span' textStyle='small'>
					Checking sanctions
				</Text>
			</HStack>
		</Menu.Item>
	);
}

function Separator() {
	return <Box borderTop='1px solid' borderColor='purple.700' my={1} />;
}

export function ModerationActionsMenu({
	poem,
	user,
	ariaLabel = 'Open moderation actions',
	size = 'sm',
	variant = 'ghost',
	onActionComplete,
}: ModerationActionsMenuProps) {
	const authClient = useAuthClientStore((state) => state.authClient);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null);
	const targetUser = user ?? poem?.author;
	const canShowPoemActions = canModeratePoemTarget(authClient) && Boolean(poem);
	const canShowUserActions = canModerateUserTarget(authClient, targetUser);
	const shouldFetchSanctionStatus =
		isMenuOpen && canShowUserActions && Boolean(targetUser?.id);

	const sanctionStatusQuery = useQuery({
		...moderation.getUserSanctionStatus.query(String(targetUser?.id ?? 0)),
		enabled: shouldFetchSanctionStatus,
		staleTime: 1000 * 30,
	});

	const userActions = useMemo<ActionItem[]>(() => {
		if (!canShowUserActions) return [];
		const hasActiveBan = targetUser?.status === 'banned' || Boolean(sanctionStatusQuery.data?.activeBan);
		const hasActiveSuspension =
			targetUser?.status === 'suspended' || Boolean(sanctionStatusQuery.data?.activeSuspension);

		if (hasActiveBan) return [{ action: 'unban-user', icon: RotateCcw }];
		if (hasActiveSuspension) {
			return [
				{ action: 'unsuspend-user', icon: RotateCcw },
				{ action: 'ban-user', icon: Ban },
			];
		}
		return [
			{ action: 'suspend-user', icon: Clock3 },
			{ action: 'ban-user', icon: Ban },
		];
	}, [
		canShowUserActions,
		sanctionStatusQuery.data?.activeBan,
		sanctionStatusQuery.data?.activeSuspension,
		targetUser?.status,
	]);

	const poemActions = useMemo(
		() =>
			canShowPoemActions
				? POEM_ACTIONS.filter((item) => shouldShowPoemAction(item.action, poem))
				: [],
		[canShowPoemActions, poem],
	);

	const { executeAction, isPending } = useModerationActions({
		onActionComplete,
	});

	const selectedActionIsUserAction = selectedAction?.endsWith('-user') ?? false;
	const isCheckingSanctions = shouldFetchSanctionStatus && sanctionStatusQuery.isLoading;
	const hasActions = poemActions.length > 0 || userActions.length > 0 || isCheckingSanctions;

	if (!hasActions) return null;

	async function handleConfirm(payload: { reason?: string; durationDays?: number }) {
		if (!selectedAction) return;
		await executeAction({
			action: selectedAction,
			poem,
			user: selectedActionIsUserAction ? targetUser : undefined,
			reason: payload.reason,
			durationDays: payload.durationDays,
		});
		setSelectedAction(null);
	}

	return (
		<Box
			position='relative'
			zIndex={2}
			onClick={(event) => event.stopPropagation()}
			onMouseDown={(event) => event.stopPropagation()}
		>
			<Menu.Root
				positioning={{ placement: 'bottom-end' }}
				onOpenChange={(details) => setIsMenuOpen(details.open)}
			>
				<Menu.Trigger asChild>
					<IconButton aria-label={ariaLabel} size={size} variant={variant} disabled={isPending}>
						<EllipsisVertical size={16} />
					</IconButton>
				</Menu.Trigger>
				<Portal>
					<Menu.Positioner>
						<Menu.Content
							bg='rgba(27, 0, 25, 0.98)'
							border='1px solid'
							borderColor='purple.700'
							borderRadius='lg'
							backdropFilter='blur(6px)'
							minW='230px'
							p={1}
						>
							{poemActions.map((item) => (
								<ActionMenuItem key={item.action} item={item} onSelect={setSelectedAction} />
							))}
							{poemActions.length > 0 && (userActions.length > 0 || isCheckingSanctions) ? (
								<Separator />
							) : null}
							{isCheckingSanctions ? <LoadingSanctionsItem /> : null}
							{!isCheckingSanctions &&
								userActions.map((item) => (
									<ActionMenuItem key={item.action} item={item} onSelect={setSelectedAction} />
								))}
						</Menu.Content>
					</Menu.Positioner>
				</Portal>
			</Menu.Root>

			<ModerationActionDialog
				action={selectedAction}
				poem={poem}
				user={selectedActionIsUserAction ? targetUser : undefined}
				isOpen={Boolean(selectedAction)}
				isSubmitting={isPending}
				onClose={() => setSelectedAction(null)}
				onConfirm={handleConfirm}
			/>
		</Box>
	);
}

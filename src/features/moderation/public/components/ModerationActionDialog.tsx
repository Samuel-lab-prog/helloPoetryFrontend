import { Box, Button, Field, Flex, Input, Portal, Text, Textarea } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';

import type { ModerationAction, ModerationTargetPoem, ModerationTargetUser } from '../types';
import {
	getPoemTargetLabel,
	getUserTargetLabel,
	moderationActionConfig,
} from '../utils/actionConfig';

type ModerationActionDialogProps = {
	action: ModerationAction | null;
	poem?: ModerationTargetPoem;
	user?: ModerationTargetUser;
	isOpen: boolean;
	isSubmitting: boolean;
	onClose: () => void;
	onConfirm: (payload: { reason?: string; durationDays?: number }) => Promise<void>;
};

function getTargetLabel(
	action: ModerationAction,
	poem?: ModerationTargetPoem,
	user?: ModerationTargetUser,
) {
	if (action.endsWith('-poem')) return getPoemTargetLabel(poem);
	return getUserTargetLabel(user);
}

export function ModerationActionDialog({
	action,
	poem,
	user,
	isOpen,
	isSubmitting,
	onClose,
	onConfirm,
}: ModerationActionDialogProps) {
	const [reason, setReason] = useState('');
	const [durationDays, setDurationDays] = useState('7');

	useEffect(() => {
		if (!isOpen) return;
		setReason('');
		setDurationDays('7');
	}, [action, isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	const config = action ? moderationActionConfig[action] : null;
	const targetLabel = action ? getTargetLabel(action, poem, user) : '';
	const trimmedReason = reason.trim();
	const parsedDuration = durationDays.trim() ? Number(durationDays) : undefined;
	const reasonIsValid = !config?.requiresReason || trimmedReason.length >= 10;
	const durationIsValid =
		!config?.requiresDuration ||
		parsedDuration === undefined ||
		(Number.isInteger(parsedDuration) && parsedDuration >= 1 && parsedDuration <= 365);
	const canConfirm = Boolean(config) && reasonIsValid && durationIsValid && !isSubmitting;

	const reasonHelp = useMemo(() => {
		if (!config?.requiresReason) return null;
		if (!trimmedReason) return 'At least 10 characters.';
		if (reasonIsValid) return `${trimmedReason.length}/500 characters.`;
		return 'Reason must be at least 10 characters.';
	}, [config?.requiresReason, reasonIsValid, trimmedReason]);

	if (!isOpen || !action || !config) return null;

	async function handleConfirm() {
		if (!canConfirm) return;
		await onConfirm({
			reason: config?.requiresReason ? trimmedReason : undefined,
			durationDays: config?.requiresDuration ? parsedDuration : undefined,
		});
	}

	return (
		<Portal>
			<Box
				position='fixed'
				inset={0}
				zIndex={1400}
				bg='rgba(8, 0, 12, 0.68)'
				backdropFilter='blur(4px)'
				display='flex'
				alignItems='center'
				justifyContent='center'
				p={4}
				onClick={onClose}
			>
				<Box
					role='dialog'
					aria-modal='true'
					aria-label={config.buildTitle(targetLabel)}
					w='full'
					maxW='md'
					border='1px solid'
					borderColor='purple.700'
					borderRadius='xl'
					bg='rgba(27, 0, 25, 0.98)'
					boxShadow='0 22px 60px rgba(0, 0, 0, 0.48)'
					p={{ base: 4, md: 5 }}
					onClick={(event) => event.stopPropagation()}
				>
					<Flex direction='column' gap={4}>
						<Box>
							<Text textStyle='h4' color='pink.50' mb={2}>
								{config.buildTitle(targetLabel)}
							</Text>
							<Text textStyle='smaller' color='pink.100'>
								{config.buildDescription(targetLabel)}
							</Text>
						</Box>

						{config.requiresDuration ? (
							<Field.Root invalid={!durationIsValid}>
								<Field.Label textStyle='small' color='pink.100'>
									Duration in days
								</Field.Label>
								<Input
									type='number'
									min={1}
									max={365}
									value={durationDays}
									onChange={(event) => setDurationDays(event.target.value)}
									textStyle='small'
									bg='rgba(255, 255, 255, 0.03)'
									borderColor='border'
									_hover={{ borderColor: 'borderHover' }}
									_focusVisible={{
										borderColor: 'pink.300',
										boxShadow: '0 0 0 5px rgba(255, 143, 189, 0.25)',
									}}
								/>
								<Field.HelperText color='pink.200'>Leave 7 for the default.</Field.HelperText>
								<Field.ErrorText>Use a number between 1 and 365.</Field.ErrorText>
							</Field.Root>
						) : null}

						{config.requiresReason ? (
							<Field.Root required invalid={!reasonIsValid && trimmedReason.length > 0}>
								<Field.Label textStyle='small' color='pink.100'>
									Reason
								</Field.Label>
								<Textarea
									value={reason}
									maxLength={500}
									onChange={(event) => setReason(event.target.value)}
									placeholder='Explain the moderation decision'
									textStyle='small'
									bg='rgba(255, 255, 255, 0.03)'
									borderColor='border'
									minH='112px'
									_hover={{ borderColor: 'borderHover' }}
									_focusVisible={{
										borderColor: 'pink.300',
										boxShadow: '0 0 0 5px rgba(255, 143, 189, 0.25)',
									}}
								/>
								<Field.HelperText color={reasonIsValid ? 'pink.200' : 'red.300'}>
									{reasonHelp}
								</Field.HelperText>
							</Field.Root>
						) : null}

						<Flex justify='flex-end' gap={2} wrap='wrap'>
							<Button
								size='sm'
								variant='outlinePurple'
								colorPalette='gray'
								onClick={onClose}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								size='sm'
								variant={config.tone === 'danger' ? 'danger' : 'solidPink'}
								onClick={handleConfirm}
								loading={isSubmitting}
								disabled={!canConfirm}
							>
								{config.confirmLabel}
							</Button>
						</Flex>
					</Flex>
				</Box>
			</Box>
		</Portal>
	);
}

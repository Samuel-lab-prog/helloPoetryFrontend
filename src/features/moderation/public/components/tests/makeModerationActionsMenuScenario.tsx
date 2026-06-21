import { moderation } from '@Api/moderation/endpoints';
import { moderationKeys } from '@Api/moderation/keys';
import { clearTestAuthClient, setTestAuthClient } from '@root/core/testing/authClientStore';
import { renderWithProviders } from '@root/core/testing/renderWithProviders';
import { vi } from 'vitest';

import type { ModerationTargetPoem, ModerationTargetUser } from '../../types';
import { ModerationActionsMenu } from '../ModerationActionsMenu';
import { moderatorClient, noActiveSanctions, pendingPoem } from './fixtures';

export function makeModerationActionsMenuScenario() {
	const onActionComplete = vi.fn();
	const props: {
		poem?: ModerationTargetPoem;
		user?: ModerationTargetUser;
		ariaLabel: string;
	} = {
		poem: pendingPoem,
		ariaLabel: 'Open moderation actions',
	};
	const scenario = {
		mocks: {
			onActionComplete,
			userSanctionStatusQuery: vi
				.spyOn(moderation.getUserSanctionStatus, 'query')
				.mockImplementation((userId) => ({
					queryKey: moderationKeys.userSanctionStatus(userId),
					queryFn: () => Promise.resolve(noActiveSanctions),
				})),
		},
		asLoggedOutVisitor() {
			clearTestAuthClient();
			return scenario;
		},
		asClient(client = moderatorClient) {
			setTestAuthClient(client);
			return scenario;
		},
		withPoem(poem?: ModerationTargetPoem) {
			props.poem = poem;
			return scenario;
		},
		withUser(user: ModerationTargetUser) {
			props.poem = undefined;
			props.user = user;
			return scenario;
		},
		withAriaLabel(ariaLabel: string) {
			props.ariaLabel = ariaLabel;
			return scenario;
		},
		render() {
			return renderWithProviders(
				<ModerationActionsMenu
					poem={props.poem}
					user={props.user}
					ariaLabel={props.ariaLabel}
					onActionComplete={onActionComplete}
				/>,
			);
		},
	};

	return scenario;
}

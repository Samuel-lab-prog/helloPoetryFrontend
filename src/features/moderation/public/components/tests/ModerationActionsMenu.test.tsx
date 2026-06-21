// @vitest-environment happy-dom
import { clearTestAuthClient } from '@root/core/testing/authClientStore';
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	adminClient,
	authorClient,
	moderatorClient,
	pendingPoem,
	rejectedPoem,
	removedPoem,
	targetAdmin,
	targetAuthor,
	targetModerator,
} from './fixtures';
import { makeModerationActionsMenuScenario } from './makeModerationActionsMenuScenario';

async function openMenu() {
	fireEvent.click(screen.getByRole('button', { name: 'Open moderation actions' }));
	expect(await screen.findByRole('menu')).toBeTruthy();
}

describe('FEATURE COMPONENT - Moderation - ModerationActionsMenu', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		clearTestAuthClient();
	});

	it('does not render moderation actions for logged-out visitors or regular authors', () => {
		makeModerationActionsMenuScenario().asLoggedOutVisitor().render();
		expect(screen.queryByRole('button', { name: 'Open moderation actions' })).toBeNull();

		makeModerationActionsMenuScenario().asClient(authorClient).render();
		expect(screen.queryByRole('button', { name: 'Open moderation actions' })).toBeNull();
	});

	it('shows approve, reject, and remove actions for pending poems', async () => {
		makeModerationActionsMenuScenario().asClient(moderatorClient).withPoem(pendingPoem).render();

		await openMenu();

		expect(screen.getByText('Approve poem')).toBeTruthy();
		expect(screen.getByText('Reject poem')).toBeTruthy();
		expect(screen.getByText('Remove poem')).toBeTruthy();
	});

	it('does not show reject for already rejected poems', async () => {
		makeModerationActionsMenuScenario().asClient(moderatorClient).withPoem(rejectedPoem).render();

		await openMenu();

		expect(screen.getByText('Approve poem')).toBeTruthy();
		expect(screen.queryByText('Reject poem')).toBeNull();
		expect(screen.getByText('Remove poem')).toBeTruthy();
	});

	it('does not render a trigger when no actions are available for a removed poem', () => {
		makeModerationActionsMenuScenario().asClient(moderatorClient).withPoem(removedPoem).render();

		expect(screen.queryByRole('button', { name: 'Open moderation actions' })).toBeNull();
	});

	it('shows user moderation actions for active author targets', async () => {
		const scenario = makeModerationActionsMenuScenario()
			.asClient(moderatorClient)
			.withUser(targetAuthor);
		scenario.render();

		await openMenu();

		expect(await screen.findByText('Suspend user')).toBeTruthy();
		expect(screen.getByText('Ban user')).toBeTruthy();
		expect(scenario.mocks.userSanctionStatusQuery).toHaveBeenCalledWith(String(targetAuthor.id));
	});

	it('does not let moderators moderate themselves or admins', () => {
		makeModerationActionsMenuScenario()
			.asClient(moderatorClient)
			.withUser({ ...targetAuthor, id: moderatorClient.id })
			.render();
		expect(screen.queryByRole('button', { name: 'Open moderation actions' })).toBeNull();

		makeModerationActionsMenuScenario().asClient(moderatorClient).withUser(targetAdmin).render();
		expect(screen.queryByRole('button', { name: 'Open moderation actions' })).toBeNull();
	});

	it('lets admins moderate moderator targets', async () => {
		makeModerationActionsMenuScenario().asClient(adminClient).withUser(targetModerator).render();

		await openMenu();

		expect(await screen.findByText('Suspend user')).toBeTruthy();
		expect(screen.getByText('Ban user')).toBeTruthy();
	});
});

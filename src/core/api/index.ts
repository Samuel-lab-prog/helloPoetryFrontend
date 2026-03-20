import { auth } from './auth/endpoints';

import { users } from './users/endpoints';
import { userKeys } from './users/keys';

import { poems } from './poems/endpoints';
import { poemKeys } from './poems/keys';

import { friends } from './friends/endpoints';
import { friendsKeys } from './friends/keys';

import { interactions } from './interactions/endpoints';
import { interactionsKeys } from './interactions/keys';

import { moderation } from './moderation/endpoints';
import { moderationKeys } from './moderation/keys';

import { feed } from './feed/endpoints';
import { feedKeys } from './feed/keys';

import { notifications } from './notifications/endpoints';
import { notificationsKeys } from './notifications/keys';

export const api = {
	auth,
	users,
	poems,
	friends,
	interactions,
	moderation,
	feed,
	notifications,
};

export const apiKeys = {
	users: userKeys,
	poems: poemKeys,
	friends: friendsKeys,
	interactions: interactionsKeys,
	feed: feedKeys,
	notifications: notificationsKeys,
	moderation: moderationKeys,
};

export {
	userKeys,
	poemKeys,
	friendsKeys,
	interactionsKeys,
	feedKeys,
	notificationsKeys,
	moderationKeys,
};

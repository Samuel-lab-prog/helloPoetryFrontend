import { userKeys } from '../../features/users/api/keys';
import { feedKeys } from './feed/keys';
import { friendsKeys } from './friends/keys';
import { interactionsKeys } from './interactions/keys';
import { moderationKeys } from './moderation/keys';
import { notificationsKeys } from './notifications/keys';
import { poemKeys } from './poems/keys';

export const apiKeys = {
	feed: feedKeys,
	friends: friendsKeys,
	interactions: interactionsKeys,
	moderation: moderationKeys,
	notifications: notificationsKeys,
	poems: poemKeys,
	users: userKeys,
};

import { feed } from '@features/feed/api/endpoints';
import { friends } from '@features/friends/api/endpoints';
import { interactions } from '@features/interactions/api/endpoints';
import { moderation } from '@features/moderation/api/endpoints';
import { notifications } from '@features/notifications/api/endpoints';
import { poems } from '@features/poems/api/endpoints';
import { users } from '@features/users/api/endpoints';

export const api = {
	feed,
	friends,
	interactions,
	moderation,
	notifications,
	poems,
	users,
};

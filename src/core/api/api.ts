import { users } from '../../features/users/api/endpoints';
import { feed } from './feed/endpoints';
import { friends } from './friends/endpoints';
import { interactions } from './interactions/endpoints';
import { moderation } from './moderation/endpoints';
import { notifications } from './notifications/endpoints';
import { poems } from './poems/endpoints';

export const api = {
	feed,
	friends,
	interactions,
	moderation,
	notifications,
	poems,
	users,
};

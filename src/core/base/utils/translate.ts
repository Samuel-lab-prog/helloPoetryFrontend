import type { ModerationPoem } from '@root/core/api/moderation/types';

export function translateVisibility(visibility: ModerationPoem['visibility']) {
	switch (visibility) {
		case 'public':
			return 'Publico';
		case 'private':
			return 'Privado';
		case 'unlisted':
			return 'Nao listado';
		default:
			return visibility;
	}
}

export function translateModerationStatus(status: ModerationPoem['moderationStatus']) {
	switch (status) {
		case 'approved':
			return 'Aprovado';
		case 'rejected':
			return 'Rejeitado';
		case 'pending':
			return 'Pendente';
		case 'removed':
			return 'Removido';
		default:
			return status;
	}
}

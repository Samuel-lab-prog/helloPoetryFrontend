export type NavbarLink = {
	label: string;
	to: string;
};

import {
	Bell,
	BookOpen,
	House,
	LogIn,
	PenSquare,
	Shield,
	User,
	UserPlus,
	Users,
} from 'lucide-react';

export function getLinkIcon(to: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
	switch (to) {
		case '/':
			return House;
		case '/poems':
			return BookOpen;
		case '/poets':
			return Users;
		case '/poems/new':
			return PenSquare;
		case '/my-profile':
			return User;
		case '/notifications':
			return Bell;
		case '/admin/moderation':
			return Shield;
		case '/register':
			return UserPlus;
		case '/login':
			return LogIn;
		default:
			return BookOpen;
	}
}

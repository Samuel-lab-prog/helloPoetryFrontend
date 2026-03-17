import { Bell, BookOpen, House, LogIn, PenSquare, User, UserPlus, Users } from 'lucide-react';

export function getLinkIcon(to: string) {
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
		case '/register':
			return UserPlus;
		case '/login':
			return LogIn;
		default:
			return BookOpen;
	}
}

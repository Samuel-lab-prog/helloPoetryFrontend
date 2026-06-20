import { renderHook } from '@testing-library/react';
import type { TouchEvent } from 'react';

import { useNotificationSwipe } from '../useNotificationSwipe';

function touchEvent(x: number, y: number) {
	return {
		touches: [{ clientX: x, clientY: y }],
	} as unknown as TouchEvent;
}

export function makeNotificationSwipeScenario() {
	const scenario = {
		render() {
			return renderHook(() => useNotificationSwipe());
		},
		touchStart(x: number, y = 0) {
			return touchEvent(x, y);
		},
		touchMove(x: number, y = 0) {
			return touchEvent(x, y);
		},
	};

	return scenario;
}

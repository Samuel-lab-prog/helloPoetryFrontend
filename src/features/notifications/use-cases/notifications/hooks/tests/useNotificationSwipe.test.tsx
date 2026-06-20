// @vitest-environment happy-dom
import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { makeNotificationSwipeScenario } from './makeNotificationSwipeScenario';

describe('FEATURE HOOK - Notifications - useNotificationSwipe', () => {
	it('opens the swipe actions after a left swipe beyond the threshold', () => {
		const scenario = makeNotificationSwipeScenario();
		const { result } = scenario.render();

		act(() => {
			result.current.handleTouchStart(scenario.touchStart(100));
			result.current.handleTouchMove(scenario.touchMove(20));
		});

		expect(result.current.offsetX).toBe(-72);
		expect(result.current.isDragging).toBe(true);

		act(() => {
			result.current.handleTouchEnd();
		});

		expect(result.current.isOpen).toBe(true);
		expect(result.current.offsetX).toBe(-72);
		expect(result.current.isDragging).toBe(false);
	});

	it('ignores mostly vertical movement and closes the swipe state', () => {
		const scenario = makeNotificationSwipeScenario();
		const { result } = scenario.render();

		act(() => {
			result.current.handleTouchStart(scenario.touchStart(100, 0));
			result.current.handleTouchMove(scenario.touchMove(90, 100));
			result.current.handleTouchEnd();
		});

		expect(result.current.isOpen).toBe(false);
		expect(result.current.offsetX).toBe(0);

		act(() => {
			result.current.close();
		});

		expect(result.current.isOpen).toBe(false);
		expect(result.current.offsetX).toBe(0);
	});
});

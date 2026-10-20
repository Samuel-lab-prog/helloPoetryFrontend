// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';

import { scrollFocusedControlIntoView } from './scrollFocusedControlIntoView';

function setRect(element: HTMLElement, rect: Partial<DOMRect>) {
	element.getBoundingClientRect = vi.fn(
		() =>
			({
				x: 0,
				y: 0,
				left: 0,
				top: 0,
				right: 100,
				bottom: 100,
				width: 100,
				height: 100,
				toJSON: () => ({}),
				...rect,
			}) as DOMRect,
	);
}

function addTargetAndNav(targetRect: Partial<DOMRect>, navRect: Partial<DOMRect>) {
	const target = document.createElement('textarea');
	const nav = document.createElement('nav');
	target.scrollIntoView = vi.fn();
	nav.style.position = 'fixed';
	nav.style.opacity = '1';
	document.body.append(target, nav);
	setRect(target, targetRect);
	setRect(nav, navRect);
	return { target, nav };
}

describe('scrollFocusedControlIntoView', () => {
	afterEach(() => {
		document.body.replaceChildren();
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it('scrolls a focused control only when the visible mobile navigation covers it', () => {
		const { target } = addTargetAndNav(
			{ top: 680, bottom: 720, left: 10, right: 200 },
			{ top: 700, bottom: 760, left: 0, right: 375, height: 60 },
		);
		vi.stubGlobal('innerHeight', 760);

		scrollFocusedControlIntoView(target);

		expect(target.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'smooth' });
	});

	it('does not scroll controls that do not overlap the mobile navigation', () => {
		const { target } = addTargetAndNav(
			{ top: 620, bottom: 690, left: 10, right: 200 },
			{ top: 700, bottom: 760, left: 0, right: 375, height: 60 },
		);
		vi.stubGlobal('innerHeight', 760);

		scrollFocusedControlIntoView(target);

		expect(target.scrollIntoView).not.toHaveBeenCalled();
	});

	it('ignores the display-none navigation used at desktop breakpoints', () => {
		const { target, nav } = addTargetAndNav(
			{ top: 300, bottom: 400, left: 10, right: 200 },
			{ top: 0, bottom: 0, left: 0, right: 0, height: 0 },
		);
		nav.style.display = 'none';
		vi.stubGlobal('innerHeight', 800);

		scrollFocusedControlIntoView(target);

		expect(target.scrollIntoView).not.toHaveBeenCalled();
	});

	it('ignores a mobile navigation that has been moved below the viewport', () => {
		const { target, nav } = addTargetAndNav(
			{ top: 700, bottom: 750, left: 10, right: 200 },
			{ top: 760, bottom: 820, left: 0, right: 375, height: 60 },
		);
		nav.style.opacity = '0';
		vi.stubGlobal('innerHeight', 760);

		scrollFocusedControlIntoView(target);

		expect(target.scrollIntoView).not.toHaveBeenCalled();
	});
});

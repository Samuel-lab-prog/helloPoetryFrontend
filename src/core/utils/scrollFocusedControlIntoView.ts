export function scrollFocusedControlIntoView(target: EventTarget) {
	if (!(target instanceof HTMLElement)) return;

	const bottomNav = [...document.querySelectorAll('nav')].find((nav) => {
		const rect = nav.getBoundingClientRect();
		const isVisibleBottomNav =
			getComputedStyle(nav).position === 'fixed' &&
			rect.height > 0 &&
			rect.top < window.innerHeight &&
			rect.bottom >= window.innerHeight &&
			Number(getComputedStyle(nav).opacity) > 0;

		return isVisibleBottomNav;
	});
	if (!bottomNav) return;

	const navRect = bottomNav.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const overlapsNav =
		targetRect.bottom > navRect.top &&
		targetRect.top < navRect.bottom &&
		targetRect.right > navRect.left &&
		targetRect.left < navRect.right;

	if (overlapsNav) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

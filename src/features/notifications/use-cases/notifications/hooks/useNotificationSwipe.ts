import { useRef, useState } from 'react';

const MAX_SWIPE_PX = 72;
const OPEN_THRESHOLD = MAX_SWIPE_PX * 0.5;

type SwipeHandlers = {
	offsetX: number;
	isDragging: boolean;
	handleTouchStart: (event: React.TouchEvent) => void;
	handleTouchMove: (event: React.TouchEvent) => void;
	handleTouchEnd: () => void;
	close: () => void;
	isOpen: boolean;
};

export function useNotificationSwipe(): SwipeHandlers {
	const [offsetX, setOffsetX] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const startRef = useRef({ x: 0, y: 0, offset: 0 });
	const swipingRef = useRef(false);

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}

	function handleTouchStart(event: React.TouchEvent) {
		const touch = event.touches[0];
		startRef.current = { x: touch.clientX, y: touch.clientY, offset: offsetX };
		swipingRef.current = false;
		setIsDragging(true);
	}

	function handleTouchMove(event: React.TouchEvent) {
		const touch = event.touches[0];
		const dx = touch.clientX - startRef.current.x;
		const dy = touch.clientY - startRef.current.y;
		if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) return;
		swipingRef.current = true;
		const nextOffset = clamp(startRef.current.offset + dx, -MAX_SWIPE_PX, 0);
		setOffsetX(nextOffset);
	}

	function handleTouchEnd() {
		setIsDragging(false);
		if (!swipingRef.current) return;
		swipingRef.current = false;
		const shouldOpen = offsetX <= -OPEN_THRESHOLD;
		setOffsetX(shouldOpen ? -MAX_SWIPE_PX : 0);
	}

	function close() {
		setOffsetX(0);
	}

	return {
		offsetX,
		isDragging,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		close,
		isOpen: offsetX < 0,
	};
}

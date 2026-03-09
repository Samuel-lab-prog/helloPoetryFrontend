export interface AppEvents {
	userLoggedIn: {
		userId: number;
		role: string;
		status: string;
		loggedInAt: string;
	};
	userLoggedOut: {
		userId: number | null;
		reason: 'manual' | 'sessionExpired' | 'unauthorized';
		loggedOutAt: string;
	};
}

type EventMap = object;
type EventName<TEvents extends EventMap> = Extract<keyof TEvents, string>;
type EventPayload<TEvents extends EventMap, N extends EventName<TEvents>> = TEvents[N];
type EventHandler<TEvents extends EventMap, N extends EventName<TEvents>> = (
	payload: EventPayload<TEvents, N>,
) => void | Promise<void>;
type AnyHandler = (payload: unknown) => void | Promise<void>;

type Unsubscribe = () => void;

export interface EventBus<TEvents extends EventMap> {
	publish<N extends EventName<TEvents>>(name: N, payload: EventPayload<TEvents, N>): Promise<void>;
	subscribe<N extends EventName<TEvents>>(name: N, handler: EventHandler<TEvents, N>): Unsubscribe;
	once<N extends EventName<TEvents>>(name: N, handler: EventHandler<TEvents, N>): Unsubscribe;
}

export function createInMemoryEventBus<TEvents extends EventMap>(): EventBus<TEvents> {
	const handlers: Partial<Record<EventName<TEvents>, Set<AnyHandler>>> = {};

	async function publish<N extends EventName<TEvents>>(
		name: N,
		payload: EventPayload<TEvents, N>,
	): Promise<void> {
		const set = handlers[name];
		if (!set || set.size === 0) return;

		const list = Array.from(set);
		await list.reduce<Promise<void>>(async (chain, handler) => {
			await chain;
			await handler(payload);
		}, Promise.resolve());
	}

	function subscribe<N extends EventName<TEvents>>(
		name: N,
		handler: EventHandler<TEvents, N>,
	): Unsubscribe {
		const set = handlers[name] ?? new Set<AnyHandler>();

		set.add(handler as AnyHandler);
		handlers[name] = set;

		return () => {
			set.delete(handler as AnyHandler);
		};
	}

	function once<N extends EventName<TEvents>>(
		name: N,
		handler: EventHandler<TEvents, N>,
	): Unsubscribe {
		const unsubscribe = subscribe(name, async (payload) => {
			unsubscribe();
			await handler(payload);
		});

		return unsubscribe;
	}

	return {
		publish,
		subscribe,
		once,
	};
}

export const eventBus = createInMemoryEventBus<AppEvents>();

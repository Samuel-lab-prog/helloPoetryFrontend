import { type usePoem } from '../hooks/usePoem';

export type Poem = NonNullable<ReturnType<typeof usePoem>['poem']>;

export type DedicationUser = {
	id: number;
	nickname?: string;
	name?: string;
};

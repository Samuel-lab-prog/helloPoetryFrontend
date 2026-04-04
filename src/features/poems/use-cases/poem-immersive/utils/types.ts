import { type PoemDedicationUser } from '@Api/poems/types';

import { type usePoem } from '../../poem/hooks/usePoem';

export type Poem = NonNullable<ReturnType<typeof usePoem>['poem']>;

export type DedicationUser = PoemDedicationUser;

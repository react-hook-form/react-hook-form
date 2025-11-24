import { expectType } from 'tsd';

import type { ControllerRenderProps } from '../types';

type FormValues = {
  test: string;
};

/** {@link Controller} */ {
  /** it should include undefined in value type */
  const props = {} as ControllerRenderProps<FormValues, 'test'>;
  expectType<string | undefined>(props.value);
}

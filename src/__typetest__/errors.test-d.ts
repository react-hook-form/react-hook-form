import { expectType } from 'tsd';

import { FieldError, FieldErrors } from '../types';

import { _ } from './__fixtures__';

/** {@link FieldErrors} */ {
  /** it should support optional record fields */
  {
    const actual = _ as FieldErrors<{
      test?: string;
      test1?: string;
    }>;
    expectType<{
      test?: FieldError;
      test1?: FieldError;
    }>(actual);
  }
}

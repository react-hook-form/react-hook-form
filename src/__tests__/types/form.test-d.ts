import React from 'react';
import { expectType } from 'tsd';

import {
  SubmitErrorHandler,
  SubmitHandler,
  UseFormHandleSubmit,
} from '../../types';

import { _ } from './__fixtures__';

/** {@link UseFormHandleSubmit} */ {
  /** it should infer the correct form values */ {
    const actual = _ as UseFormHandleSubmit<{ test: string; test1: number }>;
    expectType<
      (
        onValid: SubmitHandler<{ test: string; test1: number }>,
        onInvalid?: SubmitErrorHandler<{ test: string; test1: number }>,
      ) => (e?: React.BaseSyntheticEvent) => Promise<void>
    >(actual);
  }
}

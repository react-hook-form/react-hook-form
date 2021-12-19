import { expectType } from 'tsd';

import { Path } from '../types';

import { type } from './utils';

test('should not throw type error with path name', () => {
  type Actual = Path<{
    test: {
      test: Array<{
        name: string;
      }>;
      testName: string;
    };
  }>;

  type Expected =
    | 'test'
    | 'test.test'
    | 'test.testName'
    | `test.test.${number}`
    | `test.test.${number}.name`;

  expectType<Expected>(type<Actual>());
});

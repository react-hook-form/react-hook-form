import { expectType } from 'tsd';

import { IsAny, IsNever } from '../../types';

import { _ } from './__fixtures__';

/** {@link IsAny} */ {
  /** it should evaluate to true for any */ {
    const actual = _ as IsAny<any>;
    expectType<true>(actual);
  }

  /** it should evaluate to false for never */ {
    const actual = _ as IsAny<never>;
    expectType<false>(actual);
  }

  /** it should evaluate to false for unknown */ {
    const actual = _ as IsAny<unknown>;
    expectType<false>(actual);
  }

  /** it should evaluate to false for string */ {
    const actual = _ as IsAny<string>;
    expectType<false>(actual);
  }
}

/** {@link IsNever} */ {
  /** it should evaluate to false for any */ {
    const actual = _ as IsNever<any>;
    expectType<false>(actual);
  }

  /** it should evaluate to true for never */ {
    const actual = _ as IsNever<never>;
    expectType<true>(actual);
  }

  /** it should evaluate to false for unknown */ {
    const actual = _ as IsNever<unknown>;
    expectType<false>(actual);
  }

  /** it should evaluate to false for string */ {
    const actual = _ as IsNever<string>;
    expectType<false>(actual);
  }
}

import {
  beforeAll,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';

import unsetEmptyArray from '../../logic/unsetEmptyArray';
import unset from '../../utils/unset';

vi.mock('../../utils/unset', () => ({
  default: vi.fn(),
}));

describe('unsetEmptyArray', () => {
  const mockedUnset = unset as MockedFunction<typeof unset>;

  beforeAll(() => {
    mockedUnset.mockClear();
  });

  it('should call unset when the array is empty', () => {
    const ref = { foo: [] as unknown[] };

    unsetEmptyArray(ref, 'foo');

    expect(mockedUnset).toHaveBeenCalledWith(ref, 'foo');
  });

  it('should not call unset when the array is not empty', () => {
    const ref = { foo: ['data'] };

    unsetEmptyArray(ref, 'foo');

    expect(mockedUnset).not.toHaveBeenCalled();
  });
});

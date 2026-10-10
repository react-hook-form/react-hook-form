import getValidateError from '../../logic/getValidateError';
import noop from '../../utils/noop';

describe('getValidateError', () => {
  it('return field error in correct format', () => {
    expect(
      getValidateError(
        'This is a required field',
        {
          name: 'test1',
          value: '',
        },
        'required',
      ),
    ).toEqual({
      type: 'required',
      message: 'This is a required field',
      ref: {
        name: 'test1',
        value: '',
      },
    });

    expect(
      getValidateError(
        false,
        {
          name: 'test1',
          value: '',
        },
        'required',
      ),
    ).toEqual({
      type: 'required',
      message: '',
      ref: {
        name: 'test1',
        value: '',
      },
    });
  });

  it('return undefined when called with non string result', () => {
    expect(getValidateError(undefined, noop)).toBeUndefined();
  });
});

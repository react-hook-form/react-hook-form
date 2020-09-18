import isSameError from './isSameError';

describe('isSameError', () => {
  it('should detect if it contain the same error', () => {
    expect(
      isSameError(
        {
          type: 'test',
          message: 'what',
        },
        {
          type: 'test',
          message: 'what',
        },
      ),
    ).toBeTruthy();

    expect(
      isSameError(
        {
          type: '',
          message: '',
        },
        {
          type: '',
          message: '',
        },
      ),
    ).toBeTruthy();

    expect(
      isSameError(
        {
          type: '',
          types: {
            minLength: 'min',
          },
          message: '',
        },
        {
          type: '',
          types: {
            minLength: 'min',
          },
          message: '',
        },
      ),
    ).toBeTruthy();
  });

  it('should return false when error is not even defined', () => {
    expect(
      isSameError(
        {
          type: '',
          message: 'test',
        },
        {
          type: '',
          message: '',
        },
      ),
    ).toBeFalsy();

    expect(
      isSameError('test' as any, {
        type: '',
        message: '',
      }),
    ).toBeFalsy();

    expect(
      isSameError(5 as any, {
        type: '',
        message: '',
      }),
    ).toBeFalsy();
  });

  it('should return false when errors object length not match', () => {
    expect(
      isSameError(
        {
          // @ts-ignore
          test: {
            type: '',
            message: 'test',
          },
        },
        {
          type: '',
          message: '',
        },
      ),
    ).toBeFalsy();

    expect(
      isSameError(
        {
          // @ts-ignore
          test: {
            type: '',
            message: 'test',
          },
        },
        {
          test: {
            type: '',
            message: 'test',
          },
          test1: {
            type: '',
            message: 'test',
          },
        },
      ),
    ).toBeFalsy();
  });

  it('should return false when they are not the same error', () => {
    expect(
      isSameError(
        {
          type: 'test',
          message: 'what',
          types: {
            minLength: 'min',
          },
        },
        {
          type: 'test',
          message: 'what',
        },
      ),
    ).toBeFalsy();

    expect(
      isSameError(
        {
          type: '',
          message: '',
          types: {
            maxLength: 'max',
          },
        },
        {
          type: '',
          message: '',
          types: {
            minLength: 'min',
          },
        },
      ),
    ).toBeFalsy();
  });
});

import isSameError from './isSameError';
import { FieldError } from '../types/form';

describe('isSameError', () => {
  it('should detect if it contain the same error', () => {
    expect(
      isSameError(
        {
          type: 'test',
          message: 'what',
        } as FieldError,
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
        } as FieldError,
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
        } as FieldError,
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
      isSameError(undefined, {
        type: '',
        message: '',
      }),
    ).toBeFalsy();

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

  it('should return false when they are not the same error', () => {
    expect(
      isSameError(
        {
          type: 'test',
          message: 'what',
          types: {
            minLength: 'min',
          },
        } as FieldError,
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
        } as FieldError,
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

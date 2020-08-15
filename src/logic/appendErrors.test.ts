import appendErrors from './appendErrors';

describe('appendErrors', () => {
  it('should return empty object when validateAllFieldCriteria is false', () => {
    const errors: any = {
      test: {
        type: 'required',
        message: 'test',
      },
    };
    expect(appendErrors<any>('test', false, errors, 'min', 'test')).toEqual({});
  });

  it('should return error object when validateAllFieldCriteria is true', () => {
    const errors: any = {
      test: {
        type: 'required',
        message: 'test',
      },
    };

    expect(appendErrors<any>('test', true, errors, 'required', 'test')).toEqual(
      {
        message: 'test',
        type: 'required',
        types: {
          required: 'test',
        },
      },
    );

    errors.test.types = { required: 'test' };
    expect(appendErrors<any>('test', true, errors, 'min', 'test')).toEqual({
      message: 'test',
      type: 'required',
      types: {
        required: 'test',
        min: 'test',
      },
    });

    errors.test.types = { ...errors.test.types, min: 'test' };
    expect(appendErrors<any>('test', true, errors, 'max', 'test')).toEqual({
      message: 'test',
      type: 'required',
      types: {
        required: 'test',
        min: 'test',
        max: 'test',
      },
    });

    errors.test.types = { ...errors.test.types, max: 'test' };
    expect(
      appendErrors<any>('test', true, errors, 'undefined', undefined),
    ).toEqual({
      message: 'test',
      type: 'required',
      types: {
        required: 'test',
        min: 'test',
        max: 'test',
        undefined: true,
      },
    });
  });
});

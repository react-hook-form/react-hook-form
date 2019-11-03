import validateWithSchema, { parseErrorSchema } from './validateWithSchema';

const errors = {
  name: 'ValidationError',
  value: { createdOn: '2019-03-27T04:05:51.503Z' },
  path: undefined,
  type: undefined,
  errors: ['name is a required field', 'age is a required field'],
  inner: [
    {
      name: 'ValidationError',
      value: undefined,
      path: 'name',
      type: 'required',
      errors: [],
      inner: [],
      message: 'name is a required field',
      params: [],
    },
    {
      name: 'ValidationError',
      value: undefined,
      path: 'name',
      type: 'min',
      errors: [],
      inner: [],
      message: 'name is a min field',
      params: [],
    },
    {
      name: 'ValidationError',
      value: undefined,
      path: 'age',
      type: 'required',
      errors: [],
      inner: [],
      message: 'age is a required field',
      params: [],
    },
  ],
};

describe('parseErrorSchema', () => {
  it('should parse the validation errors into react hook form errors format', () => {
    expect(parseErrorSchema(errors as any, false)).toMatchSnapshot();
  });

  it('should parse the validation errors and append all errors', () => {
    expect(parseErrorSchema(errors as any, true)).toMatchSnapshot();
  });
});

describe('validateWithSchema', () => {
  it('should return undefined when no error reported', async () => {
    expect(
      await validateWithSchema(
        {
          validate: () => {
            throw errors;
          },
        },
        { abortEarly: false },
        false,
        {},
      ),
    ).toMatchSnapshot();
  });

  it('should return empty object when validate pass', async () => {
    expect(
      await validateWithSchema(
        {
          validate: () => new Promise(resolve => resolve()),
        },
        { abortEarly: false },
        false,
        {},
      ),
    ).toEqual({
      fieldErrors: {},
      result: undefined,
    });
  });
});

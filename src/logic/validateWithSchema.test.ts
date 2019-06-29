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
  it('should parse the validaiton errors into react hook form errors format', () => {
    expect(parseErrorSchema(errors)).toMatchSnapshot();
  });
});

describe('validateWithSchema', () => {
  it('should return undefined when no error reported', async () => {
    expect(
      await validateWithSchema(
        {
          validate: () => {
            // @ts-ignore
            throw errors;
          },
        },
        {},
      ),
    ).toMatchSnapshot();
  });

  it('should return empty object when validate pass', async () => {
    expect(
      await validateWithSchema(
        {
          validate: () => {},
        },
        {},
      ),
    ).toEqual({});
  });
});

import validateField from './validateField';

describe('validateField', () => {
  it('should return required true when input not filled with required', () => {
    expect(
      validateField(
        {
          ref: { type: 'checkbox', checked: false, name: 'test' },
          required: true,
        },
        {},
      ),
    ).toEqual({
      test: {
        required: true,
      },
    });

    expect(
      validateField(
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: true,
        },
        {},
      ),
    ).toEqual({
      test: {
        required: true,
      },
    });

    expect(
      validateField(
        {
          ref: { type: 'radio', name: 'test' },
          required: true,
        },
        {
          test: {
            ref: {},
            options: [],
          },
        },
      ),
    ).toEqual({
      test: {
        required: true,
      },
    });
  });

  it('should return max error', () => {
    expect(
      validateField(
        {
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          max: 8,
        },
        {},
      ),
    ).toEqual({
      test: {
        max: true,
      },
    });

    expect(
      validateField(
        {
          ref: { type: 'date', name: 'test', value: new Date('2019-2-12') },
          required: true,
          max: new Date('2019-1-12'),
        },
        {},
      ),
    ).toEqual({
      test: {
        max: true,
      },
    });
  });

  it('should return min error', () => {
    expect(
      validateField(
        {
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          min: 12,
        },
        {},
      ),
    ).toEqual({
      test: {
        min: true,
      },
    });

    expect(
      validateField(
        {
          ref: { type: 'date', name: 'test', value: new Date('2019-2-12') },
          required: true,
          min: new Date('2019-3-12'),
        },
        {},
      ),
    ).toEqual({
      test: {
        min: true,
      },
    });
  });

  it('should return max length error ', () => {
    expect(
      validateField(
        {
          ref: { type: 'text', name: 'test', value: 'This is a long text input' },
          required: true,
          maxLength: 12,
        },
        {},
      ),
    ).toEqual({
      test: {
        maxLength: true,
      },
    });
  });

  it('should return min length error ', () => {
    expect(
      validateField(
        {
          ref: { type: 'text', name: 'test', value: 'This is a long text input' },
          required: true,
          minLength: 200,
        },
        {},
      ),
    ).toEqual({
      test: {
        minLength: true,
      },
    });
  });

  it('should return pattern error when not matching', () => {
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    expect(
      validateField(
        {
          ref: { type: 'text', name: 'test', value: 'This is a long text input' },
          required: true,
          pattern: emailRegex,
        },
        {},
      ),
    ).toEqual({
      test: {
        pattern: true,
      },
    });

    expect(
      validateField(
        {
          ref: { type: 'text', name: 'test', value: 'test@test.com' },
          required: true,
          pattern: emailRegex,
        },
        {},
      ),
    ).toEqual({});
  });

  it('should validate for custom validation', () => {
    expect(
      validateField(
        {
          ref: { type: 'text', name: 'test', value: 'This is a long text input' },
          required: true,
          validate: value => value.toString().length < 3,
        },
        {},
      ),
    ).toEqual({
      test: {
        validate: true,
      },
    });

    expect(
      validateField(
        {
          ref: { type: 'text', name: 'test', value: 'This is a long text input' },
          required: true,
          validate: {
            test: value => value.toString().length < 3,
            test1: value => value.toString().length < 3,
          },
        },
        {},
      ),
    ).toEqual({
      validate: {
        test: true,
        test1: true,
      },
    });
  });
});

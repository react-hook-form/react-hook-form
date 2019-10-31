import validateField from './validateField';
import getRadioValue from './getRadioValue';

jest.mock('./getRadioValue');

const setCustomValidity = () => {};

describe('validateField', () => {
  it('should return required true when input not filled with required', async () => {
    (getRadioValue as any).mockImplementation(() => ({
      value: '2',
    }));
    expect(
      await validateField(
        {
          ref: {
            type: 'checkbox',
            checked: false,
            name: 'test',
            setCustomValidity,
          },
          required: true,
        },
        {},
        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'checkbox',
          checked: false,
          name: 'test',
          setCustomValidity,
        },
        message: '',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'text', value: '', name: 'test', setCustomValidity },
          required: true,
        },
        {},
        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: { type: 'text', value: '', name: 'test', setCustomValidity },
        message: '',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'radio', name: 'test', setCustomValidity },
          required: true,
        },
        {
          test: {
            ref: {},
            options: [
              {
                ref: 'test',
              },
            ],
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        message: '',
        type: 'required',
        ref: 'test',
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'text', value: '', name: 'test', setCustomValidity },
          required: 'test',
        },
        {},
        false,
        false,
      ),
    ).toEqual({
      test: {
        message: 'test',
        type: 'required',
        ref: { type: 'text', name: 'test', value: '', setCustomValidity },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'radio', value: '', name: 'test', setCustomValidity },
          required: 'test',
        },
        {
          test: {
            ref: 'test',
            options: [
              {
                ref: 'test',
              },
            ],
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        message: 'test',
        type: 'required',
        ref: 'test',
      },
    });
  });

  it('should return max error', async () => {
    expect(
      await validateField(
        {
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          max: 0,
        },
        {},
        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: { type: 'number', name: 'test', value: 10 },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          max: 8,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: { type: 'number', name: 'test', value: 10 },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'custom', name: 'test', value: '' },
          required: true,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'required',
        message: '',
        ref: { type: 'custom', name: 'test', value: '' },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'custom', name: 'test', value: undefined },
          required: true,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'required',
        message: '',
        ref: { type: 'custom', name: 'test', value: undefined },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'custom', name: 'test', value: null },
          required: true,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'required',
        message: '',
        ref: { type: 'custom', name: 'test', value: null },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'custom', name: 'test', value: 'ok' },
          required: true,
        },
        {},

        false,
        false,
      ),
    ).toEqual({});

    expect(
      await validateField(
        {
          ref: { type: 'date', name: 'test', value: '2019-2-12' },
          required: true,
          max: '2019-1-12',
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: { type: 'date', name: 'test', value: '2019-2-12' },
      },
    });
  });

  it('should return min error', async () => {
    expect(
      await validateField(
        {
          ref: { type: 'number', name: 'test', value: -1 },
          required: true,
          min: 0,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: { type: 'number', name: 'test', value: -1 },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          min: 12,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: { type: 'number', name: 'test', value: 10 },
      },
    });

    expect(
      await validateField(
        {
          ref: { type: 'date', name: 'test', value: '2019-2-12' },
          required: true,
          min: '2019-3-12',
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: { type: 'date', name: 'test', value: '2019-2-12' },
      },
    });
  });

  it('should return max length error ', async () => {
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          maxLength: 12,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
        message: '',
        type: 'maxLength',
      },
    });
  });

  it('should return min length error ', async () => {
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          minLength: 200,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
        message: '',
        type: 'minLength',
      },
    });
  });

  it('should return pattern error when not matching', async () => {
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          pattern: emailRegex,
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
        message: '',
        type: 'pattern',
      },
    });

    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          pattern: {
            value: emailRegex,
            message: 'regex failed',
          },
        },
        {},

        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
        message: 'regex failed',
        type: 'pattern',
      },
    });

    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'test@test.com',
            setCustomValidity,
          },
          required: true,
          pattern: emailRegex,
        },
        {},

        false,
        false,
      ),
    ).toEqual({});
  });

  it('should validate for custom validation', async () => {
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          validate: value => value.toString().length > 3,
        },
        {
          test: {
            ref: {},
          },
        },
        false,
        false,
      ),
    ).toEqual({});

    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          validate: value => value.toString().length < 3,
        },
        {
          test: {
            ref: {},
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        message: '',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
        type: 'validate',
      },
    });

    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          required: true,
          validate: {
            test: value => value.toString().length < 3,
            test1: value => value.toString().length > 10,
          },
        },
        {
          test: {
            ref: {},
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
        type: 'test',
        message: '',
      },
    });

    (getRadioValue as any).mockImplementation(() => {
      return {
        isValid: false,
        value: 'test',
      };
    });

    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input!',
            setCustomValidity,
          },
          validate: {
            test: value => value.toString().length < 3,
            test1: value => value.toString().length > 10,
          },
        },
        {
          test: {
            ref: '',
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: {
          name: 'test',
          type: 'text',
          value: 'This is a long text input!',
          setCustomValidity,
        },
        type: 'test',
        message: '',
      },
    });

    expect(
      await validateField(
        {
          ref: {
            type: 'radio',
            name: 'test',
            value: 'This is a long text input!',
            setCustomValidity,
          },
          validate: {
            test: value => value.toString().length < 3,
            test1: value => value.toString().length > 10,
          },
          options: [
            {
              ref: 'data',
            },
          ],
        },
        {
          test: {
            ref: '',
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        ref: 'data',
        type: 'test',
        message: '',
      },
    });
  });

  it('should return error message when it is defined', async () => {
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          validate: {
            test: value => {
              if (value.toString().length > 3) {
                return 'max 3';
              }
              return true;
            },
          },
        },
        {
          test: {
            ref: {},
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'test',
        message: 'max 3',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
      },
    });
  });

  it('should return result or empty string when validate has error', async () => {
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
          validate: value => value.toString().length < 3 || 'bill',
        },
        {
          test: {
            ref: {},
          },
        },
        false,
        false,
      ),
    ).toEqual({
      test: {
        type: 'validate',
        message: 'bill',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
          setCustomValidity,
        },
      },
    });
  });

  it('if undefined returned from validate, no error is reported', async () => {
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          validate: () => undefined,
        },
        {
          test: {
            ref: {},
          },
        },
        false,
        false,
      ),
    ).toEqual({});
  });

  it('should call setCustomValidity with empty string when native validation is on', async () => {
    const setCustomValidity = jest.fn();
    expect(
      await validateField(
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
            setCustomValidity,
          },
        },
        {},
        true,
        false,
      ),
    ).toEqual({});
    expect(setCustomValidity).toBeCalledWith('');
  });

  it('should return all validation errors', async () => {
    (getRadioValue as any).mockImplementation(() => ({
      value: '',
    }));
    expect(
      await validateField(
        {
          ref: { type: 'text', value: '', name: 'test', setCustomValidity },
          required: true,
          minLength: 10,
          pattern: /d/i,
          validate: value => value === 'test',
        },
        {},
        false,
        true,
      ),
    ).toMatchSnapshot();
  });

  it('should return all validation error messages', async () => {
    (getRadioValue as any).mockImplementation(() => ({
      value: '',
    }));
    expect(
      await validateField(
        {
          ref: { type: 'text', value: '', name: 'test', setCustomValidity },
          required: 'test',
          minLength: {
            value: 10,
            message: 'minLength',
          },
          pattern: {
            value: /d/i,
            message: 'pattern',
          },
          validate: {
            test: value => value === 'test',
            test1: value => value == 'test' || 'Luo',
            test2: value => value == 'test' || 'Bill',
          },
        },
        {},
        false,
        true,
      ),
    ).toMatchSnapshot();
  });
});

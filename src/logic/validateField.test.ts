import validateField from './validateField';
import getRadioValue from './getRadioValue';

jest.mock('./getRadioValue');

const setCustomValidity = () => {};

describe('validateField', () => {
  it('should return required true when input not filled with required', async () => {
    // @ts-ignore
    getRadioValue.mockImplementation(() => ({
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
          },
        },
      ),
    ).toEqual({
      test: {
        message: 'test',
        type: 'required',
        ref: '',
      },
    });
  });

  it('should return max error', async () => {
    expect(
      await validateField(
        {
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          max: 8,
        },
        {},
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
          ref: { type: 'date', name: 'test', value: '2019-2-12' },
          required: true,
          max: '2019-1-12',
        },
        {},
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
          ref: { type: 'number', name: 'test', value: 10 },
          required: true,
          min: 12,
        },
        {},
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
        {},
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
        {},
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
        {},
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

    // @ts-ignore
    getRadioValue.mockImplementation(() => {
      return {
        isValid: false,
        value: 'test',
      };
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
        },
        {
          test: {
            ref: '',
          },
        },
      ),
    ).toEqual({
      test: {
        ref: {
          name: 'test',
          type: 'radio',
          value: 'This is a long text input!',
          setCustomValidity,
        },
        type: 'test1',
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
      ),
    ).toEqual({
      test: {
        ref: 'data',
        type: 'test1',
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
        {},
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
        {},
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
      ),
    ).toEqual({});
    expect(setCustomValidity).toBeCalledWith('');
  });
});

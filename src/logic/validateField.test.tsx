import validateField from './validateField';
import getRadioValue from './getRadioValue';
import getCheckboxValue from './getCheckboxValue';

jest.mock('./getRadioValue');
jest.mock('./getCheckboxValue');

describe('validateField', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return required true when input not filled with required', async () => {
    (getRadioValue as any).mockImplementation(() => ({
      value: '2',
    }));
    (getCheckboxValue as any).mockImplementation(() => ({
      value: false,
      isValid: false,
    }));

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: true,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: { type: 'text', value: '', name: 'test' },
        message: '',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: 'required',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: { type: 'text', value: '', name: 'test' },
        message: 'required',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: 'required',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: { type: 'text', value: '', name: 'test' },
        message: 'required',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: {
            value: true,
            message: 'required',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: { type: 'text', value: '', name: 'test' },
        message: 'required',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: {
            value: true,
            message: 'required',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: { type: 'text', value: '', name: 'test' },
        message: 'required',
        type: 'required',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: {
            value: false,
            message: 'required',
          },
        },
        { current: {} },
      ),
    ).toEqual({});

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {} as any,
              options: [
                {
                  ref: 'test',
                } as any,
              ],
            },
          },
        },
        false,
        {
          ref: { type: 'radio', name: 'test' },
          required: true,
        },
        { current: {} },
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
        {} as any,
        false,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: 'test',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        message: 'test',
        type: 'required',
        ref: { type: 'text', name: 'test', value: '' },
      },
    });

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: 'test' as any,
              options: [
                {
                  ref: 'test',
                } as any,
              ],
            },
          },
        },
        false,
        {
          ref: { type: 'radio', value: '', name: 'test' },
          required: 'test',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        message: 'test',
        type: 'required',
        ref: 'test',
      },
    });

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: 'test' as any,
              options: [
                {
                  ref: 'test',
                },
              ] as any,
            },
          },
        },
        false,
        {
          ref: { type: 'checkbox', name: 'test' },
          required: 'test',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        message: 'test',
        type: 'required',
        ref: 'test',
      },
    });

    (getCheckboxValue as any).mockImplementation(() => ({
      value: 'test',
      isValid: true,
    }));
    expect(
      await validateField(
        {
          current: {
            test: {
              ref: 'test' as any,
              options: [
                {
                  ref: 'test',
                },
              ] as any,
            },
          },
        },
        false,
        {
          ref: { type: 'checkbox', name: 'test' },
          required: 'test',
        },
        { current: {} },
      ),
    ).toEqual({});
  });

  it('should return max error', async () => {
    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
          required: true,
          max: 0,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
          required: true,
          max: {
            value: 0,
            message: 'max',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: 'max',
        ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
          required: true,
          max: {
            value: 0,
            message: 'max',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: 'max',
        ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
          required: true,
          max: 8,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'custom', name: 'test', value: '', valueAsNumber: NaN },
          required: true,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'required',
        message: '',
        ref: { type: 'custom', name: 'test', value: '', valueAsNumber: NaN },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'custom',
            name: 'test',
            value: undefined,
            valueAsNumber: NaN,
          },
          required: true,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'required',
        message: '',
        ref: {
          type: 'custom',
          name: 'test',
          value: undefined,
          valueAsNumber: NaN,
        },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'custom',
            name: 'test',
            value: null,
            valueAsNumber: NaN,
          },
          required: true,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'required',
        message: '',
        ref: { type: 'custom', name: 'test', value: null, valueAsNumber: NaN },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'custom', name: 'test', value: 'ok' },
          required: true,
        },
        { current: {} },
      ),
    ).toEqual({});

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'date',
            name: 'test',
            value: '2019-2-13',
          },
          required: true,
          max: '2019-1-12',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: {
          type: 'date',
          name: 'test',
          value: '2019-2-13',
        },
      },
    });
  });

  it('should return min error', async () => {
    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: -1, valueAsNumber: -1 },
          required: true,
          min: 0,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: { type: 'number', name: 'test', value: -1, valueAsNumber: -1 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: -1, valueAsNumber: -1 },
          required: true,
          min: {
            value: 0,
            message: 'min',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: 'min',
        ref: { type: 'number', name: 'test', value: -1, valueAsNumber: -1 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: -1, valueAsNumber: -1 },
          required: true,
          min: {
            value: 0,
            message: 'min',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: 'min',
        ref: { type: 'number', name: 'test', value: -1, valueAsNumber: -1 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
          required: true,
          min: 12,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: { type: 'number', name: 'test', value: 10, valueAsNumber: 10 },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'date',
            name: 'test',
            value: '2019-2-12',
            valueAsDate: new Date('2019-2-12'),
          },
          required: true,
          min: '2019-3-12',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: {
          type: 'date',
          name: 'test',
          value: '2019-2-12',
          valueAsDate: new Date('2019-2-12'),
        },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'date',
            name: 'test',
            value: '2019-2-12',
          },
          required: true,
          min: {
            value: '2019-3-12',
            message: 'min',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: 'min',
        ref: {
          type: 'date',
          name: 'test',
          value: '2019-2-12',
        },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'date',
            name: 'test',
            value: '2019-2-12',
            valueAsDate: new Date('2019-2-12'),
          },
          required: true,
          min: {
            value: '2019-3-12',
            message: 'min',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: 'min',
        ref: {
          type: 'date',
          name: 'test',
          value: '2019-2-12',
          valueAsDate: new Date('2019-2-12'),
        },
      },
    });
  });

  it('should return min and max error for custom input', async () => {
    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: '', name: 'test', value: '1' },
          required: true,
          min: '4',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'min',
        message: '',
        ref: { type: '', name: 'test', value: '1' },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: { type: '', name: 'test', value: '4' },
          required: true,
          max: '2',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: { type: '', name: 'test', value: '4' },
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: '',
            name: 'test',
            value: '2019-2-12',
            valueAsDate: new Date('2019-2-12'),
          },
          required: true,
          max: '2019-1-12',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'max',
        message: '',
        ref: {
          type: '',
          name: 'test',
          value: '2019-2-12',
          valueAsDate: new Date('2019-2-12'),
        },
      },
    });
  });

  it('should return max length error ', async () => {
    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          maxLength: 12,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: '',
        type: 'maxLength',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          maxLength: {
            value: 12,
            message: 'maxLength',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: 'maxLength',
        type: 'maxLength',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          maxLength: {
            value: 12,
            message: 'maxLength',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: 'maxLength',
        type: 'maxLength',
      },
    });
  });

  it('should return min length error ', async () => {
    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          minLength: 200,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: '',
        type: 'minLength',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          minLength: {
            value: 200,
            message: 'minLength',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: 'minLength',
        type: 'minLength',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          minLength: {
            value: 200,
            message: 'minLength',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: 'minLength',
        type: 'minLength',
      },
    });
  });

  it('should return pattern error when not matching', async () => {
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          pattern: emailRegex,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: '',
        type: 'pattern',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          pattern: {
            value: emailRegex,
            message: 'regex failed',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: 'regex failed',
        type: 'pattern',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          pattern: {
            value: emailRegex,
            message: 'regex failed',
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        message: 'regex failed',
        type: 'pattern',
      },
    });

    expect(
      await validateField(
        {} as any,
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'test@test.com',
          },
          required: true,
          pattern: emailRegex,
        },
        { current: {} },
      ),
    ).toEqual({});
  });

  it('should validate for custom validation', async () => {
    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          validate: (value) => value.toString().length > 3,
        },
        { current: {} },
      ),
    ).toEqual({});

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          validate: (value) => value.toString().length < 3,
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        message: '',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
        type: 'validate',
      },
    });

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          required: true,
          validate: {
            test: (value) => value.toString().length < 3,
            test1: (value) => value.toString().length > 10,
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
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
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input!',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input!',
          },
          validate: {
            test: (value) => value.toString().length < 3,
            test1: (value) => value.toString().length > 10,
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        ref: {
          name: 'test',
          type: 'text',
          value: 'This is a long text input!',
        },
        type: 'test',
        message: '',
      },
    });

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'radio',
                name: 'test',
                value: 'This is a long text input!',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'radio',
            name: 'test',
            value: 'This is a long text input!',
          },
          validate: {
            test: (value) => value.toString().length < 3,
            test1: (value) => value.toString().length > 10,
          },
          options: [
            {
              ref: 'data' as any,
            },
          ],
        },
        { current: {} },
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
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          validate: {
            test: (value) => {
              if (value.toString().length > 3) {
                return 'max 3';
              }
              return true;
            },
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'test',
        message: 'max 3',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
      },
    });

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          validate: {
            test: (value) => {
              if (value.toString().length > 3) {
                return 'max 3';
              }
              return true;
            },
          },
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'test',
        message: 'max 3',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
      },
    });
  });

  it('should return result or empty string when validate has error', async () => {
    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          validate: (value) => value.toString().length < 3 || 'bill',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'validate',
        message: 'bill',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
      },
    });

    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {
                type: 'text',
                name: 'test',
                value: 'This is a long text input',
              },
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          validate: (value) => value.toString().length < 3 || 'bill',
        },
        { current: {} },
      ),
    ).toEqual({
      test: {
        type: 'validate',
        message: 'bill',
        ref: {
          type: 'text',
          name: 'test',
          value: 'This is a long text input',
        },
      },
    });
  });

  it('if undefined returned from validate, no error is reported', async () => {
    expect(
      await validateField(
        {
          current: {
            test: {
              ref: {} as any,
            },
          },
        },
        false,
        {
          ref: {
            type: 'text',
            name: 'test',
            value: 'This is a long text input',
          },
          validate: () => undefined,
        },
        { current: {} },
      ),
    ).toEqual({});
  });

  it('should return all validation errors', async () => {
    (getRadioValue as any).mockImplementation(() => ({
      value: '',
    }));
    expect(
      await validateField(
        {
          current: {
            test: { ref: { type: 'text', value: '', name: 'test' } },
          },
        },
        true,
        {
          ref: { type: 'text', value: '', name: 'test' },
          required: true,
          minLength: 10,
          pattern: /d/i,
          validate: (value) => value === 'test',
        },
        { current: {} },
      ),
    ).toMatchSnapshot();

    expect(
      await validateField(
        { current: {} },
        true,
        {
          ref: { type: 'text', value: '123', name: 'test' },
          required: true,
          minLength: 10,
          pattern: /d/i,
          validate: (value) => value === 'test',
        },
        { current: {} },
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
          current: {
            test: {
              ref: { type: 'text', value: '', name: 'test' },
            },
          },
        },
        true,
        {
          ref: { type: 'text', value: '', name: 'test' },
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
            test: (value) => value === 'test',
            test1: (value) => value == 'test' || 'Luo',
            test2: (value) => value == 'test' || 'Bill',
          },
        },
        { current: {} },
      ),
    ).toMatchSnapshot();

    expect(
      await validateField(
        { current: {} },
        true,
        {
          ref: { type: 'text', value: 'bil', name: 'test' },
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
            test: (value) => value === 'test',
            test1: (value) => value == 'test' || 'Luo',
            test2: (value) => value == 'test' || 'Bill',
          },
        },
        { current: {} },
      ),
    ).toMatchSnapshot();

    expect(
      await validateField(
        { current: {} },
        true,
        {
          ref: { type: 'text', value: 'bil', name: 'test' },
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
            test: (value) => value === 'test',
            test1: (value) => value == 'test' || 'Luo',
            test2: (value) => value == 'test' || 'Bill',
          },
        },
        { current: {} },
      ),
    ).toMatchSnapshot();
  });
});

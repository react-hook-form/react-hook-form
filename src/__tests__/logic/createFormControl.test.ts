import { createFormControl } from '../../logic/createFormControl';
import isEmptyObject from '../../utils/isEmptyObject';

jest.mock('../../utils/isEmptyObject', () => {
  const original = jest.requireActual('../../utils/isEmptyObject');
  return {
    __esModule: true,
    default: jest.fn(original.default),
  };
});

describe('createFormControl', () => {
  it('should call `executeBuiltInValidation` once for a single field', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: 'foo',
      },
    });

    register('foo', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(1);
  });

  it('should call `executeBuiltInValidation` twice for a field as an object with a single sub-field', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: {
          bar: 'bar',
        },
      },
    });

    register('foo.bar', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(2);
  });

  it('should call executeBuiltInValidation the correct number of times in case the field is an array', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: [
          {
            bar: 'bar',
            baz: 'baz',
          },
          {
            bar: 'bar',
            baz: 'baz',
          },
        ],
      },
    });

    register('foo.1.bar', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(3);
  });

  it('should only copy form values for whole-form watch reads', () => {
    const { control } = createFormControl<{
      field: string;
      probe?: string;
    }>({
      defaultValues: {
        field: 'value',
      },
    });
    let probeReads = 0;

    Object.defineProperty(control._defaultValues, 'probe', {
      configurable: true,
      enumerable: true,
      get: () => {
        probeReads++;
        return 'probe';
      },
    });

    expect(control._getWatch('field')).toBe('value');
    expect(control._getWatch(['field'])).toEqual(['value']);
    expect(probeReads).toBe(0);

    expect(control._getWatch()).toEqual({
      field: 'value',
      probe: 'probe',
    });
    expect(probeReads).toBe(1);
  });
});

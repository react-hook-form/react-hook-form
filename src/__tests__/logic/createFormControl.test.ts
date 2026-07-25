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
  it('should keep dirtyFields reference stable when dirty fields do not change', () => {
    const { control, setValue, subscribe } = createFormControl<{
      a: string;
      b: string;
    }>({
      defaultValues: {
        a: '',
        b: '',
      },
    });

    subscribe({
      formState: {
        isDirty: true,
        dirtyFields: true,
      },
      callback: jest.fn(),
    });

    const dirtyFieldsRefs = [];

    for (let i = 0; i < 4; i++) {
      setValue('a', `x${i}`, { shouldDirty: true });
      dirtyFieldsRefs.push(control._formState.dirtyFields);
    }

    expect(control._formState.dirtyFields).toEqual({ a: true });
    expect(dirtyFieldsRefs[1]).toBe(dirtyFieldsRefs[0]);
    expect(dirtyFieldsRefs[2]).toBe(dirtyFieldsRefs[0]);
    expect(dirtyFieldsRefs[3]).toBe(dirtyFieldsRefs[0]);
  });

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

  it('should clear the entire internal errors state when `clearErrors()` is called without arguments', () => {
    const { setError, clearErrors, getFieldState, control } =
      createFormControl<{
        foo: string;
        bar: string;
      }>();

    setError('foo', { type: 'required' });
    setError('bar', { type: 'required' });

    expect(getFieldState('foo').invalid).toBe(true);
    expect(control._formState.errors).not.toEqual({});

    clearErrors();

    expect(getFieldState('foo').invalid).toBe(false);
    expect(getFieldState('bar').invalid).toBe(false);
    expect(control._formState.errors).toEqual({});
  });
});

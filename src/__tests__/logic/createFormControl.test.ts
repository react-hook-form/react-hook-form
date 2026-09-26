import { createFormControl } from '../../logic/createFormControl';
import getDirtyFields from '../../logic/getDirtyFields';
import isEmptyObject from '../../utils/isEmptyObject';

jest.mock('../../utils/isEmptyObject', () => {
  const original = jest.requireActual('../../utils/isEmptyObject');
  return {
    __esModule: true,
    default: jest.fn(original.default),
  };
});

jest.mock('../../logic/getDirtyFields', () => {
  const original = jest.requireActual('../../logic/getDirtyFields');
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

  it('should reuse an emitted values snapshot across values subscribers', () => {
    const { control, subscribe } = createFormControl<{
      field: string;
      probe?: string;
    }>({
      defaultValues: {
        field: '',
      },
    });
    let probeReads = 0;
    const firstCallback = jest.fn();
    const secondCallback = jest.fn();

    Object.defineProperty(control._formValues, 'probe', {
      configurable: true,
      enumerable: true,
      get: () => {
        probeReads++;
        return 'value';
      },
    });

    subscribe({ formState: { values: true }, callback: firstCallback });
    subscribe({ formState: { values: true }, callback: secondCallback });

    control._subjects.state.next({
      values: control._formValues,
    });

    expect(firstCallback).toHaveBeenCalledTimes(1);
    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(probeReads).toBe(0);
  });

  it('should not recompute dirty fields on every change once the form is dirty', async () => {
    const fields = Array.from({ length: 20 }, (_, index) => `field${index}`);
    const { register, subscribe } = createFormControl<Record<string, string>>({
      defaultValues: Object.fromEntries(fields.map((name) => [name, ''])),
    });

    subscribe({ formState: { isDirty: true }, callback: jest.fn() });

    const onChanges = fields.map((name) => register(name).onChange);

    await onChanges[0]({
      type: 'change',
      target: { name: fields[0], value: 'value0' },
    });

    (getDirtyFields as jest.Mock).mockClear();

    for (let index = 1; index < fields.length; index++) {
      await onChanges[index]({
        type: 'change',
        target: { name: fields[index], value: `value${index}` },
      });
    }

    expect(getDirtyFields).not.toHaveBeenCalled();
  });

  it('should preserve dirty state for an unregistered conditional field', async () => {
    const { register, subscribe, unregister, control } = createFormControl<{
      data: { name: string; conditional?: string }[];
    }>({
      defaultValues: {
        data: [{ name: 'default' }],
      },
    });

    subscribe({
      formState: { isDirty: true, dirtyFields: true },
      callback: jest.fn(),
    });

    await register('data.0.conditional').onChange({
      type: 'change',
      target: { name: 'data.0.conditional', value: 'dirty' },
    });

    unregister('data.0.conditional', { keepDirty: true });

    await register('data.0.name').onChange({
      type: 'change',
      target: { name: 'data.0.name', value: 'updated' },
    });

    expect(control._formState.dirtyFields).toEqual({
      data: [{ name: true, conditional: true }],
    });
  });
});

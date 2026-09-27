import { createFormControl } from '../../logic/createFormControl';
import getDirtyFields from '../../logic/getDirtyFields';

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

  it.each(['foo', ''])(
    'should validate a single field (value: %p)',
    async (value) => {
      const { register, control } = createFormControl({
        defaultValues: {
          foo: value,
        },
      });

      register('foo', { required: true });

      await control._setValid(true);

      expect(control._formState.isValid).toBe(!!value);
    },
  );

  it.each(['bar', ''])(
    'should validate a sub-field of an object field (value: %p)',
    async (value) => {
      const { register, control } = createFormControl({
        defaultValues: {
          foo: {
            bar: value,
          },
        },
      });

      register('foo.bar', { required: true });

      await control._setValid(true);

      expect(control._formState.isValid).toBe(!!value);
    },
  );

  it.each(['bar', ''])(
    'should validate a sub-field of an array item (value: %p)',
    async (value) => {
      const { register, control } = createFormControl({
        defaultValues: {
          foo: [
            {
              bar: 'bar',
              baz: 'baz',
            },
            {
              bar: value,
              baz: 'baz',
            },
          ],
        },
      });

      register('foo.1.bar', { required: true });

      await control._setValid(true);

      expect(control._formState.isValid).toBe(!!value);
    },
  );

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

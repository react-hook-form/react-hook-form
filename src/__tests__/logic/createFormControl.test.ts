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
  it('rejects text with maxLength zero and accepts an empty value', async () => {
    const { register, trigger, setValue, getFieldState } = createFormControl({
      defaultValues: { text: 'x' },
    });
    register('text', { maxLength: 0 });

    expect(await trigger('text')).toBe(false);
    expect(getFieldState('text').error?.type).toBe('maxLength');

    setValue('text', '');
    expect(await trigger('text')).toBe(true);
    expect(getFieldState('text').error).toBeUndefined();
  });

  it('keep dirtyFields reference stable when dirty fields do not change', () => {
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

  it('call `executeBuiltInValidation` once for a single field', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: 'foo',
      },
    });

    register('foo', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(1);
  });

  it('call `executeBuiltInValidation` twice for a field as an object with a single sub-field', async () => {
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

  it('call executeBuiltInValidation the correct number of times in case the field is an array', async () => {
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

  it('clear the entire internal errors state when `clearErrors()` is called without arguments', () => {
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

  it('reuse an emitted values snapshot across values subscribers', () => {
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

  it('not recompute dirty fields on every change once the form is dirty', async () => {
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

  it('only copy form values for whole-form watch reads', () => {
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

  it.each([
    { phase: 'before mount', mounted: false },
    { phase: 'after mount', mounted: true },
  ])(
    'only copy form values for unfiltered whole-form getValues reads $phase',
    ({ mounted }) => {
      const { control, getValues } = createFormControl<{
        field: string;
        probe?: string;
      }>({
        defaultValues: { field: 'default' },
      });
      control._formValues.field = 'updated';
      control._state.mount = mounted;

      const values = mounted ? control._formValues : control._defaultValues;
      const probe = jest.fn(() => 'probe');

      Object.defineProperty(values, 'probe', {
        enumerable: true,
        get: probe,
      });

      const expectedValue = mounted ? 'updated' : 'default';

      expect(getValues('field')).toBe(expectedValue);
      expect(getValues(['field'])).toEqual([expectedValue]);
      expect(getValues([])).toEqual([]);
      expect(probe).not.toHaveBeenCalled();

      const snapshot = getValues();

      expect(snapshot).toEqual({ field: expectedValue, probe: 'probe' });
      expect(snapshot).not.toBe(values);
      expect(probe).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    { filter: 'dirtyFields', phase: 'before mount', mounted: false },
    { filter: 'dirtyFields', phase: 'after mount', mounted: true },
    { filter: 'touchedFields', phase: 'before mount', mounted: false },
    { filter: 'touchedFields', phase: 'after mount', mounted: true },
  ] as const)(
    'not read unrelated fields when filtering getValues by $filter $phase',
    ({ filter, mounted }) => {
      const { control, getValues } = createFormControl<{
        field: string;
        probe?: string;
      }>({
        defaultValues: { field: 'default' },
      });
      control._formValues.field = 'updated';
      control._state.mount = mounted;
      control._formState[filter] = { field: true };

      const values = mounted ? control._formValues : control._defaultValues;
      const probe = jest.fn(() => 'probe');
      const config =
        filter === 'dirtyFields'
          ? { dirtyFields: true }
          : { touchedFields: true };

      Object.defineProperty(values, 'probe', {
        enumerable: true,
        get: probe,
      });

      const expectedValue = mounted ? 'updated' : 'default';

      expect(getValues('field', config)).toBe(expectedValue);
      expect(getValues(['field', 'probe'], config)).toEqual([
        expectedValue,
        undefined,
      ]);
      expect(getValues([], config)).toEqual([]);

      const snapshot = getValues(undefined, config);

      expect(snapshot).toEqual({ field: expectedValue });
      expect(snapshot).not.toBe(values);
      expect(snapshot).not.toBe(getValues(undefined, config));

      snapshot.field = 'changed outside the form';

      expect(values.field).toBe(expectedValue);

      control._formState[filter] = {};

      expect(getValues(undefined, config)).toEqual({});
      expect(getValues('field', config)).toBeUndefined();
      expect(probe).not.toHaveBeenCalled();
    },
  );

  it('not share a null prototype defaultValues object with form values', () => {
    const defaultValues = Object.assign(Object.create(null), {
      name: '',
    }) as { name: string };
    const { control, register, setValue, getValues } = createFormControl({
      defaultValues,
    });

    register('name');
    control._state.mount = true;

    setValue('name', 'changed');

    expect(getValues('name')).toBe('changed');
    expect(control._defaultValues.name).toBe('');
    expect(defaultValues.name).toBe('');
    expect(control._getDirty()).toBe(true);
  });

  it('not stay dirty when defaultValues holds an empty null prototype object', () => {
    const { control, register, setValue } = createFormControl({
      defaultValues: { name: '', filters: Object.create(null) },
    });

    register('name');
    control._state.mount = true;

    setValue('name', 'changed');
    setValue('name', '');

    expect(control._getDirty()).toBe(false);
  });

  it('not share a defaultValues object that has a constructor key with form values', () => {
    const defaultValues = {
      team: { constructor: 'Ferrari', name: 'Scuderia' },
    };
    const { control, register, setValue, getValues, reset } = createFormControl(
      { defaultValues },
    );

    register('team.name');
    control._state.mount = true;

    setValue('team.name', 'Maranello');

    expect(getValues('team.name')).toBe('Maranello');
    expect(control._defaultValues.team.name).toBe('Scuderia');
    expect(defaultValues.team.name).toBe('Scuderia');
    expect(control._getDirty()).toBe(true);

    reset();

    expect(getValues('team.name')).toBe('Scuderia');
  });
});

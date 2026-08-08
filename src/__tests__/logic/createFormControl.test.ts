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

  it('does not recompute dirtyFields from scratch on every change once isDirty is tracked and true', async () => {
    const fields = Array.from({ length: 20 }, (_, i) => `f${i}`);
    const { register, subscribe } = createFormControl<Record<string, string>>({
      defaultValues: Object.fromEntries(fields.map((n) => [n, ''])),
    });

    subscribe({ formState: { isDirty: true }, callback: jest.fn() });

    const onChanges = fields.map((name) => register(name).onChange);

    // The first dirtying change legitimately needs (at most) one full
    // dirtyFields resync.
    await onChanges[0]({
      type: 'change',
      target: { name: 'f0', value: 'x' },
    } as any);

    (getDirtyFields as jest.Mock).mockClear();

    // Once the form is dirty, changing OTHER fields must not each trigger
    // a full-form getDirtyFields walk — that's an O(field count) cost per
    // keystroke that should only happen when dirtyFields could actually
    // be stale (e.g. after a silent setValue(..., { shouldDirty: false })).
    for (let i = 1; i < fields.length; i++) {
      await onChanges[i]({
        type: 'change',
        target: { name: fields[i], value: `v${i}` },
      } as any);
    }

    expect(getDirtyFields).not.toHaveBeenCalled();
  });
});

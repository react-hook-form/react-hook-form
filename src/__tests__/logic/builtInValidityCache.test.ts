import { createFormControl } from '../../logic/createFormControl';

type FormValues = { a: string; b: string };

const setup = (defaultValues: FormValues) => {
  const form = createFormControl<FormValues>({
    defaultValues,
    mode: 'onChange',
  });

  form.subscribe({ formState: { isValid: true }, callback: jest.fn() });

  const isValid = async () => {
    await form.control._setValid();

    return form.control._formState.isValid;
  };

  return { ...form, isValid };
};

describe('built-in validity cache', () => {
  it('should revalidate a cached field when its value changes', async () => {
    const { register, setValue, isValid } = setup({ a: 'x', b: 'x' });

    register('a', { required: true });
    register('b', { required: true });

    expect(await isValid()).toBe(true);

    setValue('a', '');

    expect(await isValid()).toBe(false);

    setValue('a', 'x');

    expect(await isValid()).toBe(true);
  });

  it('should revalidate a cached field when its rules change', async () => {
    const { register, isValid } = setup({ a: '', b: 'x' });

    register('a');
    register('b', { required: true });

    expect(await isValid()).toBe(true);

    register('a', { required: true });

    expect(await isValid()).toBe(false);

    register('a');

    expect(await isValid()).toBe(true);
  });

  it('should revalidate a cached field when it is disabled or enabled', async () => {
    const { register, control, isValid } = setup({ a: '', b: 'x' });

    register('a', { required: true });
    register('b', { required: true });

    expect(await isValid()).toBe(false);

    control._setDisabledField({ disabled: true, name: 'a' });

    expect(await isValid()).toBe(true);

    control._setDisabledField({ disabled: false, name: 'a' });

    expect(await isValid()).toBe(false);
  });

  it('should revalidate a cached field when it is mounted or unmounted in place', async () => {
    const { register, control, isValid } = setup({ a: '', b: 'x' });

    register('a', { required: true });
    register('b', { required: true });

    expect(await isValid()).toBe(false);

    control._fields.a!._f.mount = false;

    expect(await isValid()).toBe(true);

    control._fields.a!._f.mount = true;

    expect(await isValid()).toBe(false);
  });

  it('should always rerun validate functions that depend on other fields', async () => {
    const { register, setValue, isValid } = setup({ a: 'ok', b: 'x' });

    register('a');
    register('b', {
      validate: (_, values) => values.a === 'ok',
    });

    expect(await isValid()).toBe(true);

    setValue('a', 'changed');

    expect(await isValid()).toBe(false);
  });

  it('should update isValid when a user edit makes another cached field matter', async () => {
    const { register, setValue, control } = setup({ a: 'x', b: 'x' });

    const a = register('a', { required: true });
    register('b', { required: true });

    await control._setValid();

    expect(control._formState.isValid).toBe(true);

    setValue('b', '');

    await a.onChange({ type: 'change', target: { name: 'a', value: 'y' } });

    expect(control._formState.isValid).toBe(false);
  });
});

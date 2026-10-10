import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { Controller } from '../controller';
import { FieldArray } from '../fieldArray';
import { createFormControl } from '../logic/createFormControl';
import { scopeFormState } from '../logic/createSelect';
import type { Control, FormSelection, FormState } from '../types';
import { useController } from '../useController';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { useFormState } from '../useFormState';
import { useWatch } from '../useWatch';

type FormValues = {
  title: string;
  user: {
    firstName: string;
    lastName: string;
    address: {
      city: string;
    };
  };
  items: { name: string }[];
};

const defaultValues: FormValues = {
  title: 'title',
  user: {
    firstName: 'bill',
    lastName: 'luo',
    address: {
      city: 'sydney',
    },
  },
  items: [{ name: 'a' }, { name: 'b' }],
};

describe('select', () => {
  describe('references', () => {
    it('should return the same selection for the same path', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );

      expect(result.current.select('user')).toBe(result.current.select('user'));
      expect(result.current.select()).toBe(result.current.select());
      expect(result.current.select('user').select('address')).toBe(
        result.current.select('user.address'),
      );
      expect(result.current.select('items').select(0)).toBe(
        result.current.select('items.0'),
      );
    });

    it('should keep selections stable across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const user = result.current.select('user');
      const control = user.control;

      act(() => {
        result.current.setValue('title', 'changed');
      });
      rerender();

      expect(result.current.select('user')).toBe(user);
      expect(result.current.select('user').control).toBe(control);
    });

    it('should use the form control for the root selection', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );

      expect(result.current.select().control).toBe(result.current.control);
      expect(result.current.select().name).toBe('');
      expect(result.current.select('user.address').name).toBe('user.address');
    });

    it('should keep separate caches per form', () => {
      const { result: first } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const { result: second } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );

      expect(first.current.select('user')).not.toBe(
        second.current.select('user'),
      );
    });

    it('should be available from createFormControl', () => {
      const { select, control } = createFormControl<FormValues>({
        defaultValues,
      });

      select('user').setValue('firstName', 'kotaro');

      expect(control._formValues.user.firstName).toBe('kotaro');
      expect(select('user')).toBe(select('user'));
    });
  });

  describe('methods', () => {
    it('should read values relative to the selection', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const user = result.current.select('user');

      expect(user.getValues()).toEqual(defaultValues.user);
      expect(user.getValues('firstName')).toBe('bill');
      expect(user.getValues(['firstName', 'address.city'])).toEqual([
        'bill',
        'sydney',
      ]);
      expect(user.watch('lastName')).toBe('luo');
      expect(user.watch()).toEqual(defaultValues.user);
      expect(user.watch(['firstName', 'lastName'])).toEqual(['bill', 'luo']);
      expect(result.current.select('user.firstName').getValues()).toBe('bill');
      expect(result.current.select('items').getValues()).toEqual(
        defaultValues.items,
      );
    });

    it('should write values relative to the selection', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const user = result.current.select('user');

      act(() => {
        user.setValue('firstName', 'kotaro', { shouldDirty: true });
      });

      expect(result.current.getValues('user.firstName')).toBe('kotaro');
      expect(result.current.getValues('title')).toBe('title');
      expect(user.getFieldState('firstName').isDirty).toBe(true);
      expect(user.getFieldState('lastName').isDirty).toBe(false);
    });

    it('should merge setValues into the selected object only', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );

      act(() => {
        result.current.select('user.address').setValues({ city: 'tokyo' });
      });

      expect(result.current.getValues()).toEqual({
        ...defaultValues,
        user: { ...defaultValues.user, address: { city: 'tokyo' } },
      });

      act(() => {
        result.current
          .select('user')
          .setValues((user) => ({ ...user, lastName: 'luo2' }));
      });

      expect(result.current.getValues('user')).toEqual({
        firstName: 'bill',
        lastName: 'luo2',
        address: { city: 'tokyo' },
      });
      expect(result.current.getValues('title')).toBe('title');
    });

    it('should register fields with their full name', async () => {
      const onSubmit = jest.fn();

      const App = () => {
        const form = useForm<FormValues>({ defaultValues });
        const user = form.select('user');
        const city = user.select('address.city');

        return (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <input {...user.register('firstName')} />
            <input {...city.register({ required: true })} />
            <button>submit</button>
          </form>
        );
      };

      render(<App />);

      const [firstName, city] = screen.getAllByRole('textbox');

      expect(firstName).toHaveAttribute('name', 'user.firstName');
      expect(city).toHaveAttribute('name', 'user.address.city');

      fireEvent.change(firstName, { target: { value: 'kotaro' } });
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          {
            ...defaultValues,
            user: { ...defaultValues.user, firstName: 'kotaro' },
          },
          expect.anything(),
        ),
      );
    });

    it('should validate, set and clear errors relative to the selection', async () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const user = form.select('user');

        user.register('firstName', { validate: () => 'firstName' });
        user.register('lastName', { validate: () => 'lastName' });
        form.register('title', { validate: () => 'title' });

        return form;
      });
      const user = result.current.select('user');

      await act(async () => {
        expect(await user.trigger('firstName')).toBe(false);
      });

      expect(user.getErrors('firstName')).toMatchObject({
        message: 'firstName',
      });
      expect(user.getErrors('lastName')).toBeUndefined();

      await act(async () => {
        await user.trigger();
      });

      expect(result.current.getErrors('user.lastName')).toMatchObject({
        message: 'lastName',
      });
      expect(result.current.getErrors('title')).toBeUndefined();

      act(() => {
        user.clearErrors('firstName');
      });

      expect(result.current.getErrors('user.firstName')).toBeUndefined();
      expect(result.current.getErrors('user.lastName')).toBeDefined();

      act(() => {
        user.setError('address.city', { type: 'custom', message: 'city' });
      });

      expect(user.getFieldState('address.city').error).toMatchObject({
        message: 'city',
      });

      act(() => {
        result.current.select('user.lastName').clearErrors();
      });

      expect(result.current.getErrors('user.lastName')).toBeUndefined();

      act(() => {
        result.current.select('user.lastName').setError({
          type: 'custom',
          message: 'leaf',
        });
      });

      expect(result.current.getErrors('user.lastName')).toMatchObject({
        message: 'leaf',
      });
      expect(result.current.select('user.lastName').getFieldState()).toEqual(
        expect.objectContaining({ invalid: true }),
      );

      await act(async () => {
        await result.current.trigger('title');
      });

      act(() => {
        user.clearErrors();
      });

      expect(result.current.getErrors('user')).toBeUndefined();
      expect(result.current.getErrors('title')).toBeDefined();
    });

    it('should trigger a leaf selection', async () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });

        form.register('user.firstName', { validate: () => 'error' });

        return form;
      });

      await act(async () => {
        expect(await result.current.select('user.firstName').trigger()).toBe(
          false,
        );
      });

      expect(result.current.getErrors('user.firstName')).toMatchObject({
        message: 'error',
      });
    });

    it('should reset and unregister fields relative to the selection', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });

        form.register('user.firstName');
        form.register('user.lastName');
        form.register('title');

        return form;
      });
      const user = result.current.select('user');

      act(() => {
        user.setValue('firstName', 'kotaro');
        user.setValue('lastName', 'kotaro');
      });

      act(() => {
        user.resetField('firstName');
        result.current.select('user.lastName').resetField();
      });

      expect(user.getValues()).toEqual(defaultValues.user);

      act(() => {
        user.unregister();
      });

      expect(result.current.getValues('user.firstName')).toBeUndefined();
      expect(result.current.getValues('user.lastName')).toBeUndefined();
      expect(result.current.getValues('title')).toBe('title');
    });

    it('should focus fields relative to the selection', async () => {
      const App = ({ onReady }: { onReady: (form: any) => void }) => {
        const form = useForm<FormValues>({ defaultValues });
        onReady(form);

        return (
          <>
            <input {...form.register('user.firstName')} />
            <input {...form.register('user.lastName')} />
          </>
        );
      };
      let form: ReturnType<typeof useForm<FormValues>>;

      render(<App onReady={(f) => (form = f)} />);

      act(() => form.select('user').setFocus('lastName'));

      await waitFor(() =>
        expect(screen.getAllByRole('textbox')[1]).toHaveFocus(),
      );

      act(() => form.select('user.firstName').setFocus());

      await waitFor(() =>
        expect(screen.getAllByRole('textbox')[0]).toHaveFocus(),
      );
    });

    it('should only notify watch callbacks for the selected subtree', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const callback = jest.fn();
      const leafCallback = jest.fn();

      const subscription = result.current.select('user').watch(callback);
      const leafSubscription = result.current
        .select('user.firstName')
        .watch(leafCallback);

      act(() => {
        result.current.setValue('title', 'changed');
      });

      expect(callback).not.toHaveBeenCalled();
      expect(leafCallback).not.toHaveBeenCalled();

      act(() => {
        result.current.setValue('user.firstName', 'kotaro');
      });

      expect(callback).toHaveBeenLastCalledWith(
        { ...defaultValues.user, firstName: 'kotaro' },
        expect.objectContaining({ name: 'firstName' }),
      );
      expect(leafCallback).toHaveBeenLastCalledWith(
        'kotaro',
        expect.objectContaining({ name: '' }),
      );

      subscription.unsubscribe();
      leafSubscription.unsubscribe();
    });

    it('should scope subscribe callbacks to the selection', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const callback = jest.fn();

      const unsubscribe = result.current.select('user').subscribe({
        formState: { values: true, dirtyFields: true },
        callback,
      });

      act(() => {
        result.current.setValue('title', 'changed', { shouldDirty: true });
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        result.current.setValue('user.lastName', 'kotaro', {
          shouldDirty: true,
        });
      });

      expect(callback).toHaveBeenCalled();

      const data = callback.mock.lastCall[0];

      expect(data.name).toBe('lastName');
      expect(data.values).toEqual({
        ...defaultValues.user,
        lastName: 'kotaro',
      });
      expect(data.dirtyFields).toEqual({ lastName: true });

      unsubscribe();
    });
  });

  describe('formState', () => {
    it('should scope field maps and derived flags to the selection', async () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });

        form.register('user.firstName', { validate: () => 'error' });

        return { form, user: form.select('user') };
      });

      expect(result.current.user.formState.errors).toEqual({});
      expect(result.current.user.formState.isDirty).toBe(false);
      expect(result.current.user.formState.defaultValues).toEqual(
        defaultValues.user,
      );

      act(() => {
        result.current.form.setValue('title', 'changed', { shouldDirty: true });
      });

      expect(result.current.form.getFieldState('title').isDirty).toBe(true);
      expect(result.current.user.formState.isDirty).toBe(false);

      act(() => {
        result.current.form.setValue('user.firstName', 'kotaro', {
          shouldDirty: true,
          shouldTouch: true,
        });
      });

      expect(result.current.user.formState.isDirty).toBe(true);
      expect(result.current.user.formState.dirtyFields).toEqual({
        firstName: true,
      });
      expect(result.current.user.formState.touchedFields).toEqual({
        firstName: true,
      });

      await act(async () => {
        await result.current.form.trigger();
      });

      expect(result.current.user.formState.errors).toEqual({
        firstName: expect.objectContaining({ message: 'error' }),
      });
      expect(result.current.user.formState.isValid).toBe(false);
      expect(result.current.user.formState.submitCount).toBe(0);
    });

    it('should scope useFormState to the selection', async () => {
      let renderCount = 0;

      const UserErrors = ({
        control,
      }: {
        control: Control<FormValues['user']>;
      }) => {
        const { errors } = useFormState({ control });
        renderCount++;

        return (
          <p>error: {errors.firstName ? errors.firstName.message : 'none'}</p>
        );
      };

      const App = () => {
        const form = useForm<FormValues>({ defaultValues });

        return (
          <>
            <input {...form.register('title', { required: 'title' })} />
            <input
              {...form.register('user.firstName', { required: 'firstName' })}
            />
            <UserErrors control={form.select('user').control} />
            <button
              onClick={() => form.setError('title', { message: 'title' })}
            >
              title
            </button>
            <button
              onClick={() =>
                form.setError('user.firstName', { message: 'firstName' })
              }
            >
              firstName
            </button>
          </>
        );
      };

      render(<App />);

      expect(screen.getByText('error: none')).toBeVisible();

      const count = renderCount;

      fireEvent.click(screen.getByRole('button', { name: 'title' }));

      expect(renderCount).toBe(count);

      fireEvent.click(screen.getByRole('button', { name: 'firstName' }));

      expect(await screen.findByText('error: firstName')).toBeVisible();
    });

    it('should scope useFormState names to the selection', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const formState = useFormState({
          control: form.select('user').control,
          name: 'lastName',
        });

        return { form, formState };
      });

      act(() => {
        result.current.form.setError('user.lastName', { message: 'lastName' });
      });

      expect(result.current.formState.errors.lastName).toMatchObject({
        message: 'lastName',
      });
    });

    it('should return the scoped formState from getFieldState', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const user = form.select('user');
        const formState = useFormState({ control: user.control });

        return { form, user, formState };
      });

      act(() => {
        result.current.form.setError('user.lastName', { message: 'lastName' });
      });

      expect(
        result.current.user.getFieldState('lastName', result.current.formState)
          .error,
      ).toMatchObject({ message: 'lastName' });
    });
  });

  describe('hooks', () => {
    it('should work with useController and relative names', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const controller = useController({
          control: form.select('user').control,
          name: 'firstName',
        });

        return { form, controller };
      });

      expect(result.current.controller.field.name).toBe('user.firstName');
      expect(result.current.controller.field.value).toBe('bill');

      act(() => {
        result.current.controller.field.onChange('kotaro');
      });

      expect(result.current.controller.field.value).toBe('kotaro');
      expect(result.current.form.getValues('user.firstName')).toBe('kotaro');
      expect(result.current.controller.fieldState.isDirty).toBe(true);
      expect(result.current.controller.formState.dirtyFields).toEqual({
        firstName: true,
      });
    });

    it('should work with useController and a leaf control without name', async () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const controller = useController({
          control: form.select('user.address.city').control,
          rules: { minLength: { value: 10, message: 'short' } },
        });

        return { form, controller };
      });

      expect(result.current.controller.field.name).toBe('user.address.city');
      expect(result.current.controller.field.value).toBe('sydney');

      act(() => {
        result.current.controller.field.onChange('tokyo');
      });

      expect(result.current.form.getValues('user.address.city')).toBe('tokyo');

      await act(async () => {
        await result.current.form.trigger();
      });

      expect(result.current.controller.fieldState.error).toMatchObject({
        message: 'short',
      });
      expect(result.current.controller.formState.isDirty).toBe(true);
    });

    it('should work with Controller and a leaf control', () => {
      const App = () => {
        const form = useForm<FormValues>({ defaultValues });

        return (
          <>
            <Controller
              control={form.select('user.lastName').control}
              render={({ field }) => <input {...field} />}
            />
            <p>{form.watch('user.lastName')}</p>
          </>
        );
      };

      render(<App />);

      const input = screen.getByRole('textbox');

      expect(input).toHaveValue('luo');
      expect(input).toHaveAttribute('name', 'user.lastName');

      fireEvent.change(input, { target: { value: 'kotaro' } });

      expect(screen.getByText('kotaro')).toBeVisible();
    });

    it('should work with useWatch', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const user = form.select('user');

        return {
          form,
          user: useWatch({ control: user.control }),
          lastName: useWatch({ control: user.control, name: 'lastName' }),
          names: useWatch({
            control: user.control,
            name: ['firstName', 'address.city'],
          }),
          city: useWatch({ control: form.select('user.address.city').control }),
          length: useWatch({
            control: form.select('user.firstName').control,
            compute: (value) => value.length,
          }),
        };
      });

      expect(result.current.user).toEqual(defaultValues.user);
      expect(result.current.lastName).toBe('luo');
      expect(result.current.names).toEqual(['bill', 'sydney']);
      expect(result.current.city).toBe('sydney');
      expect(result.current.length).toBe(4);

      act(() => {
        result.current.form.setValue('user.firstName', 'kotaro');
        result.current.form.setValue('user.address.city', 'tokyo');
      });

      expect(result.current.user.firstName).toBe('kotaro');
      expect(result.current.names).toEqual(['kotaro', 'tokyo']);
      expect(result.current.city).toBe('tokyo');
      expect(result.current.length).toBe(6);
    });

    it('should not re-render useWatch for other subtrees', () => {
      let renderCount = 0;

      const City = ({ selection }: { selection: FormSelection<string> }) => {
        const city = useWatch({ control: selection.control });
        renderCount++;

        return <p>{city}</p>;
      };

      const App = () => {
        const form = useForm<FormValues>({ defaultValues });

        return (
          <>
            <input {...form.register('title')} />
            <input {...form.register('user.address.city')} />
            <City selection={form.select('user.address.city')} />
          </>
        );
      };

      render(<App />);

      const [title, city] = screen.getAllByRole('textbox');
      const count = renderCount;

      fireEvent.change(title, { target: { value: 'changed' } });

      expect(renderCount).toBe(count);

      fireEvent.change(city, { target: { value: 'tokyo' } });

      expect(screen.getByText('tokyo')).toBeVisible();
      expect(renderCount).toBe(count + 1);
    });

    it('should work with useFieldArray and relative names', () => {
      const { result } = renderHook(() => {
        const form = useForm<{ user: { items: { name: string }[] } }>({
          defaultValues: { user: { items: [{ name: 'a' }] } },
        });
        const fieldArray = useFieldArray({
          control: form.select('user').control,
          name: 'items',
        });

        return { form, fieldArray };
      });

      act(() => {
        result.current.fieldArray.append({ name: 'b' });
      });

      expect(result.current.fieldArray.fields).toEqual([
        expect.objectContaining({ name: 'a' }),
        expect.objectContaining({ name: 'b' }),
      ]);
      expect(result.current.form.getValues('user.items')).toEqual([
        { name: 'a' },
        { name: 'b' },
      ]);
    });

    it('should work with useFieldArray and an array selection without name', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const items = form.select('items');
        const fieldArray = useFieldArray({ control: items.control });

        return { form, items, fieldArray };
      });

      expect(result.current.fieldArray.fields).toEqual([
        expect.objectContaining({ name: 'a' }),
        expect.objectContaining({ name: 'b' }),
      ]);

      act(() => {
        result.current.fieldArray.remove(0);
      });

      expect(result.current.form.getValues('items')).toEqual([{ name: 'b' }]);
      expect(result.current.items.select(0).getValues()).toEqual({
        name: 'b',
      });
    });

    it('should work with FieldArray and an array selection', () => {
      const App = () => {
        const form = useForm<FormValues>({ defaultValues });
        const items = form.select('items');

        return (
          <FieldArray
            control={items.control}
            render={({ fields, append }) => (
              <>
                {fields.map((field, index) => (
                  <input
                    key={field.id}
                    {...items.select(index).register('name')}
                  />
                ))}
                <button onClick={() => append({ name: 'c' })}>append</button>
              </>
            )}
          />
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(inputs[2]).toHaveAttribute('name', 'items.2.name');
      expect(inputs[2]).toHaveValue('c');
    });

    it('should support registering through the scoped control', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const { control } = form.select('user');

        return { form, registered: control.register('firstName') };
      });

      expect(result.current.registered.name).toBe('user.firstName');
      expect(
        result.current.form.select('user').control.getFieldState('firstName'),
      ).toEqual(expect.objectContaining({ invalid: false }));
    });
  });

  describe('review regressions', () => {
    it('should resolve getFieldState against the form formState with the full name', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        form.formState.errors;
        return form;
      });

      act(() => {
        result.current.setError('user.firstName', { message: 'user' });
      });

      expect(
        result.current
          .select('user')
          .getFieldState('firstName', result.current.formState).error,
      ).toMatchObject({ message: 'user' });
      expect(
        result.current
          .select('user.address')
          .getFieldState('city', result.current.formState).invalid,
      ).toBe(false);
    });

    it('should resolve getFieldState against a formState scoped to another path', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const formState = useFormState({
          control: form.select('user').control,
        });

        return { form, formState };
      });

      act(() => {
        result.current.form.setError('user.address.city', { message: 'city' });
      });

      expect(
        result.current.form
          .select('user.address')
          .getFieldState('city', result.current.formState).error,
      ).toMatchObject({ message: 'city' });
    });

    it('should pass options to leaf setError and trigger', async () => {
      const App = ({ onReady }: { onReady: (form: any) => void }) => {
        const form = useForm<FormValues>({ defaultValues });
        onReady(form);

        return (
          <input
            {...form.register('user.firstName', { validate: () => 'error' })}
          />
        );
      };
      let form: ReturnType<typeof useForm<FormValues>>;

      render(<App onReady={(f) => (form = f)} />);

      act(() => {
        form
          .select('user.firstName')
          .setError(
            { type: 'manual', message: 'manual' },
            { shouldFocus: true },
          );
      });

      expect(screen.getByRole('textbox')).toHaveFocus();
      expect(form.getErrors('user.firstName')).toMatchObject({
        message: 'manual',
      });

      (screen.getByRole('textbox') as HTMLInputElement).blur();

      await act(async () => {
        await form.select('user.firstName').trigger({ shouldFocus: true });
      });

      expect(screen.getByRole('textbox')).toHaveFocus();
      expect(form.getErrors('user.firstName')).toMatchObject({
        message: 'error',
      });
    });

    it('should keep siblings when setValues targets a nested object', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );

      act(() => {
        result.current.select('user.address').setValues((address) => {
          expect(address).toEqual({ city: 'sydney' });
          return { city: 'tokyo' };
        });
      });

      expect(result.current.getValues()).toEqual({
        ...defaultValues,
        user: { ...defaultValues.user, address: { city: 'tokyo' } },
      });
    });

    it('should set values for a missing subtree', () => {
      const { result } = renderHook(() =>
        useForm<{ title: string; user?: { firstName: string } }>({
          defaultValues: { title: 'title' },
        }),
      );

      act(() => {
        result.current.select('user').setValues({ firstName: 'bill' });
      });

      expect(result.current.getValues()).toEqual({
        title: 'title',
        user: { firstName: 'bill' },
      });
    });

    it('should not mutate form values when setValues computes from a function', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const user = result.current.getValues('user');

      act(() => {
        result.current
          .select('user')
          .setValues((current) => ({ ...current, lastName: 'kotaro' }));
      });

      expect(user.lastName).toBe('luo');
      expect(result.current.getValues('user.lastName')).toBe('kotaro');
    });

    it('should compare values with defaults for scoped isDirty', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const user = form.select('user');

        return { form, user, isDirty: user.formState.isDirty };
      });

      act(() => {
        result.current.form.setValue('user.firstName', 'kotaro');
      });

      expect(result.current.user.formState.dirtyFields).toEqual({});
      expect(result.current.user.formState.isDirty).toBe(true);
      expect(result.current.form.select('user.address').formState.isDirty).toBe(
        false,
      );

      act(() => {
        result.current.form.setValue('user.firstName', 'bill', {
          shouldDirty: true,
        });
      });

      expect(result.current.user.formState.isDirty).toBe(false);
      expect(result.current.isDirty).toBe(false);
    });

    it('should notify scoped subscriptions when a parent object is replaced', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const onUser = jest.fn();
      const onCity = jest.fn();
      const nextUser = {
        firstName: 'kotaro',
        lastName: 'luo',
        address: { city: 'tokyo' },
      };

      const unsubscribe = result.current.select('user').subscribe({
        formState: { values: true },
        callback: onUser,
      });
      const subscription = result.current
        .select('user.address.city')
        .watch(onCity);

      act(() => {
        result.current.setValue('user', nextUser);
      });

      expect(onUser.mock.lastCall[0].values).toEqual(nextUser);
      expect(onCity).toHaveBeenLastCalledWith('tokyo', expect.anything());

      act(() => {
        result.current.setValue('user.address', { city: 'osaka' });
      });

      expect(onUser.mock.lastCall[0].values.address).toEqual({ city: 'osaka' });
      expect(onCity).toHaveBeenLastCalledWith('osaka', expect.anything());

      unsubscribe();
      subscription.unsubscribe();
    });

    it('should update useWatch on a nested selection when an ancestor changes', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const city = useWatch({
          control: form.select('user.address.city').control,
        });

        return { form, city };
      });

      act(() => {
        result.current.form.setValue('user.address', { city: 'tokyo' });
      });

      expect(result.current.city).toBe('tokyo');

      act(() => {
        result.current.form.setValue('user', {
          ...defaultValues.user,
          address: { city: 'osaka' },
        });
      });

      expect(result.current.city).toBe('osaka');
    });

    it.each([
      ['remove', (fieldArray: any) => fieldArray.remove(0), ['b', 'c']],
      ['move', (fieldArray: any) => fieldArray.move(2, 0), ['c', 'a', 'b']],
      ['swap', (fieldArray: any) => fieldArray.swap(0, 1), ['b', 'a', 'c']],
    ])(
      'should resolve cached index selections by path after %s',
      (_, action, expected) => {
        const Item = React.memo(
          ({ selection }: { selection: FormSelection<{ name: string }> }) => {
            const name = useWatch({
              control: selection.control,
              name: 'name',
            });

            return <p>{`${selection.name}:${name}`}</p>;
          },
        );

        let fieldArray: ReturnType<typeof useFieldArray<FormValues, 'items'>>;
        let form: ReturnType<typeof useForm<FormValues>>;

        const App = () => {
          form = useForm<FormValues>({
            defaultValues: {
              ...defaultValues,
              items: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
            },
          });
          fieldArray = useFieldArray({ control: form.control, name: 'items' });

          return (
            <>
              {fieldArray.fields.map((field, index) => (
                <Item
                  key={field.id}
                  selection={form.select(`items.${index}`)}
                />
              ))}
            </>
          );
        };

        render(<App />);

        const first = form!.select('items.0');

        act(() => action(fieldArray));

        expect(form!.select('items.0')).toBe(first);
        expect(first.getValues()).toEqual({ name: expected[0] });
        expect(
          screen.getAllByText(/^items\./).map((node) => node.textContent),
        ).toEqual(
          expect.arrayContaining(
            expected.map((name, index) => `items.${index}:${name}`),
          ),
        );
      },
    );

    it('should resolve getFieldState against any supplied formState', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const user = form.select('user');
        const city = form.select('user.address.city');

        form.formState.errors;

        return {
          form,
          root: form.formState,
          user: useFormState({ control: user.control }),
          address: useFormState({
            control: form.select('user.address').control,
          }),
          items: useFormState({ control: form.select('items').control }),
          city: useFormState({ control: city.control }),
        };
      });

      act(() => {
        result.current.form.setError('user.address.city', { message: 'city' });
      });

      const city = result.current.form.select('user.address');
      const expected = expect.objectContaining({
        invalid: true,
        error: expect.objectContaining({ message: 'city' }),
      });

      expect(city.getFieldState('city', result.current.root)).toEqual(expected);
      expect(city.getFieldState('city', result.current.address)).toEqual(
        expected,
      );
      expect(city.getFieldState('city', result.current.user)).toEqual(expected);
      expect(city.getFieldState('city', result.current.items)).toEqual(
        expected,
      );
      expect(
        result.current.form
          .select('user.address.city')
          .control.getFieldState('', result.current.city as never),
      ).toEqual(expected);
    });

    it('should read unrelated and leaf scoped formState from its snapshot', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const control = result.current.control;
      const snapshot = {
        ...control._formState,
        errors: {
          user: { firstName: { type: 'custom', message: 'snapshot' } },
        },
      } as FormState<FormValues>;
      const expected = expect.objectContaining({
        invalid: true,
        error: expect.objectContaining({ message: 'snapshot' }),
      });

      expect(
        result.current
          .select('user')
          .getFieldState(
            'firstName',
            scopeFormState(snapshot, 'items', control),
          ),
      ).toEqual(expected);
      expect(
        result.current
          .select('user.firstName')
          .control.getFieldState(
            '',
            scopeFormState(snapshot, 'user.firstName', control) as never,
          ),
      ).toEqual(expected);
      expect(
        result.current.select('user').getFieldState('firstName').invalid,
      ).toBe(false);
    });

    it('should match the root setValues merge semantics for partial nested values', () => {
      type User = {
        firstName: string;
        address: { city: string; postcode: string; country: string };
      };
      const user: User = {
        firstName: 'bill',
        address: { city: 'sydney', postcode: '2000', country: 'au' },
      };
      const update = { address: { city: 'tokyo' } } as Partial<User>;

      const { result } = renderHook(() => ({
        form: useForm<{ user: User; title: string }>({
          defaultValues: { user, title: 'title' },
        }),
        userForm: useForm<User>({ defaultValues: user }),
      }));

      act(() => {
        result.current.form.select('user').setValues(update);
        result.current.userForm.setValues(update);
      });

      expect(result.current.form.getValues('user')).toEqual(
        result.current.userForm.getValues(),
      );
      expect(result.current.form.getValues('user')).toEqual({
        firstName: 'bill',
        address: { city: 'tokyo' },
      });
      expect(result.current.form.getValues('title')).toBe('title');
    });

    it('should update scoped isDirty while the form is already dirty', () => {
      const scopedDirty: boolean[] = [];

      const UserDirty = ({
        control,
      }: {
        control: Control<FormValues['user']>;
      }) => {
        const { isDirty } = useFormState({ control });
        scopedDirty.push(isDirty);

        return <p>user: {String(isDirty)}</p>;
      };

      const App = () => {
        const form = useForm<FormValues>({ defaultValues });

        return (
          <>
            <input {...form.register('title')} />
            <input {...form.register('user.firstName')} />
            <p>form: {String(form.formState.isDirty)}</p>
            <UserDirty control={form.select('user').control} />
          </>
        );
      };

      render(<App />);

      const [title, firstName] = screen.getAllByRole('textbox');

      fireEvent.input(title, { target: { value: 'changed' } });

      expect(screen.getByText('form: true')).toBeVisible();
      expect(screen.getByText('user: false')).toBeVisible();

      const renders = scopedDirty.length;

      fireEvent.input(firstName, { target: { value: 'kotaro' } });

      expect(screen.getByText('user: true')).toBeVisible();

      fireEvent.input(firstName, { target: { value: 'bill' } });

      expect(screen.getByText('user: false')).toBeVisible();
      expect(screen.getByText('form: true')).toBeVisible();
      expect(scopedDirty.slice(renders)).toEqual([true, false]);
    });
  });

  describe('reshape', () => {
    const template = {
      name: 'firstName',
      location: { town: 'address.city' },
    } as const;

    it('should return the same selection for an equal map', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const user = result.current.select('user');

      expect(user.select({ ...template })).toBe(user.select(template));
      expect(user.select(template).select('name')).toBe(
        result.current.select('user.firstName'),
      );
      expect(user.select(template).select('location.town')).toBe(
        result.current.select('user.address.city'),
      );
    });

    it('should read and write values through the map', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const person = result.current.select('user').select(template);

      expect(person.getValues()).toEqual({
        name: 'bill',
        location: { town: 'sydney' },
      });
      expect(person.getValues('location.town')).toBe('sydney');

      act(() => {
        person.setValue('name', 'kotaro');
      });

      expect(result.current.getValues('user.firstName')).toBe('kotaro');

      act(() => {
        person.setValues({ location: { town: 'tokyo' } });
      });

      expect(result.current.getValues()).toEqual({
        ...defaultValues,
        user: {
          ...defaultValues.user,
          firstName: 'kotaro',
          address: { city: 'tokyo' },
        },
      });
    });

    it('should register mapped names with their full name', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const person = result.current.select('user').select(template);

      expect(person.register('location.town').name).toBe('user.address.city');
      expect(person.control.register('name').name).toBe('user.firstName');
    });

    it('should scope formState and errors through the map', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const person = form.select('user').select(template);

        return {
          form,
          person,
          formState: useFormState({ control: person.control }),
        };
      });

      act(() => {
        result.current.form.setError('user.address.city', { message: 'city' });
        result.current.form.setValue('user.lastName', 'changed');
      });

      expect(result.current.formState.errors).toEqual({
        location: { town: expect.objectContaining({ message: 'city' }) },
      });
      expect(result.current.formState.isDirty).toBe(false);
      expect(result.current.person.getFieldState('location.town').invalid).toBe(
        true,
      );

      act(() => {
        result.current.form.setValue('user.firstName', 'kotaro', {
          shouldDirty: true,
        });
      });

      expect(result.current.formState.isDirty).toBe(true);
      expect(result.current.formState.dirtyFields).toEqual({ name: true });
    });

    it('should watch a reshaped selection', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const person = form.select('user').select(template);

        return {
          form,
          person,
          value: useWatch({ control: person.control }),
          name: useWatch({ control: person.control, name: 'name' }),
        };
      });
      const callback = jest.fn();
      const subscription = result.current.person.watch(callback);

      expect(result.current.value).toEqual({
        name: 'bill',
        location: { town: 'sydney' },
      });
      expect(result.current.person.watch()).toEqual(result.current.value);

      act(() => {
        result.current.form.setValue('user.address.city', 'tokyo');
      });

      expect(result.current.value).toEqual({
        name: 'bill',
        location: { town: 'tokyo' },
      });
      expect(callback).toHaveBeenLastCalledWith(
        { name: 'bill', location: { town: 'tokyo' } },
        expect.objectContaining({ name: 'location.town' }),
      );

      act(() => {
        result.current.form.setValue('user.lastName', 'changed');
      });

      expect(callback).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.form.setValue('user.firstName', 'kotaro');
      });

      expect(result.current.name).toBe('kotaro');

      subscription.unsubscribe();
    });

    it('should reshape the form from the root', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const reshaped = result.current.select({
        heading: 'title',
        city: 'user.address.city',
      });

      expect(reshaped.getValues()).toEqual({
        heading: 'title',
        city: 'sydney',
      });
      expect(reshaped.select('city')).toBe(
        result.current.select('user.address.city'),
      );
    });

    it('should wrap a leaf selection', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const wrapped = form.select('title').select({ data: '' });

        return {
          form,
          wrapped,
          controller: useController({ control: wrapped.control, name: 'data' }),
        };
      });

      expect(result.current.wrapped.getValues()).toEqual({ data: 'title' });
      expect(result.current.controller.field.name).toBe('title');

      act(() => {
        result.current.controller.field.onChange('changed');
      });

      expect(result.current.form.getValues('title')).toBe('changed');

      act(() => {
        result.current.wrapped.setValues({ data: 'again' });
      });

      expect(result.current.form.getValues('title')).toBe('again');
    });

    it('should reshape array items for useFieldArray', () => {
      type Values = { items: { value: { inside: string } }[] };

      const { result } = renderHook(() => {
        const form = useForm<Values>({
          defaultValues: { items: [{ value: { inside: 'a' } }] },
        });
        const items = form.select('items').select([{ data: 'value.inside' }]);

        return {
          form,
          items,
          fieldArray: useFieldArray({ control: items.control }),
        };
      });

      expect(result.current.fieldArray.fields).toEqual([
        { data: 'a', id: expect.any(String) },
      ]);
      expect(result.current.items.getValues()).toEqual([{ data: 'a' }]);

      act(() => {
        result.current.fieldArray.append({ data: 'b' });
      });

      expect(result.current.form.getValues('items')).toEqual([
        { value: { inside: 'a' } },
        { value: { inside: 'b' } },
      ]);
      expect(result.current.fieldArray.fields).toEqual([
        { data: 'a', id: expect.any(String) },
        { data: 'b', id: expect.any(String) },
      ]);

      act(() => {
        result.current.fieldArray.update(0, { data: 'c' });
        result.current.fieldArray.insert(1, [{ data: 'd' }]);
      });

      expect(result.current.form.getValues('items')).toEqual([
        { value: { inside: 'c' } },
        { value: { inside: 'd' } },
        { value: { inside: 'b' } },
      ]);

      act(() => {
        result.current.fieldArray.replace([{ data: 'e' }]);
      });

      expect(result.current.form.getValues('items')).toEqual([
        { value: { inside: 'e' } },
      ]);

      const item = result.current.items.select(0);

      expect(item.getValues()).toEqual({ data: 'e' });
      expect(item.register('data').name).toBe('items.0.value.inside');
      expect(result.current.items.register('0.data').name).toBe(
        'items.0.value.inside',
      );
    });

    it.each([
      ['remove', (fieldArray: any) => fieldArray.remove(1), ['a', 'c', 'd']],
      [
        'move',
        (fieldArray: any) => fieldArray.move(3, 0),
        ['d', 'a', 'b', 'c'],
      ],
      [
        'swap',
        (fieldArray: any) => fieldArray.swap(0, 2),
        ['c', 'b', 'a', 'd'],
      ],
    ])('should keep reshaped array indices after %s', (_, action, expected) => {
      type Values = {
        items: { value: { inside: string; tag: string } }[];
      };

      const { result } = renderHook(() => {
        const form = useForm<Values>({
          defaultValues: {
            items: ['a', 'b', 'c', 'd'].map((inside) => ({
              value: { inside, tag: `${inside}-tag` },
            })),
          },
        });
        const items = form
          .select('items')
          .select([{ data: 'value.inside', meta: { tag: 'value.tag' } }]);

        return {
          form,
          items,
          fieldArray: useFieldArray({ control: items.control }),
          last: useWatch({
            control: items.control,
            name: `${expected.length - 1}.data` as '0.data',
          }),
        };
      });

      act(() => action(result.current.fieldArray));

      expect(
        result.current.fieldArray.fields.map(({ data, meta }) => [
          data,
          meta.tag,
        ]),
      ).toEqual(expected.map((inside) => [inside, `${inside}-tag`]));
      expect(result.current.form.getValues('items')).toEqual(
        expected.map((inside) => ({
          value: { inside, tag: `${inside}-tag` },
        })),
      );
      expect(result.current.last).toBe(expected[expected.length - 1]);

      expected.forEach((inside, index) => {
        const item = result.current.items.select(index);

        expect(item.getValues()).toEqual({
          data: inside,
          meta: { tag: `${inside}-tag` },
        });
        expect(item.register('meta.tag').name).toBe(`items.${index}.value.tag`);
        expect(
          result.current.items.register(`${index}.data` as '0.data').name,
        ).toBe(`items.${index}.value.inside`);
      });

      act(() => {
        result.current.items.select(0).setValue('data', 'changed');
      });

      expect(result.current.form.getValues('items.0.value.inside')).toBe(
        'changed',
      );
    });

    it('should map fields to item selections', () => {
      const App = () => {
        const form = useForm<FormValues>({ defaultValues });
        const items = form.select('items');
        const { fields } = useFieldArray({ control: items.control });

        return (
          <>
            {items.map(fields, (field, item, index, all, origin) => (
              <input
                key={field.id}
                data-origin={origin.name}
                data-count={all.length}
                aria-label={String(index)}
                {...item.register('name')}
              />
            ))}
          </>
        );
      };

      render(<App />);

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(2);
      expect(inputs[1]).toHaveAttribute('name', 'items.1.name');
      expect(inputs[1]).toHaveValue('b');
      expect(inputs[1]).toHaveAttribute('data-origin', 'items');
      expect(inputs[1]).toHaveAttribute('data-count', '2');
    });

    it('should map reshaped array fields to reshaped item selections', () => {
      const { result } = renderHook(() => {
        const form = useForm<FormValues>({ defaultValues });
        const items = form.select('items').select([{ label: 'name' }]);
        const { fields } = useFieldArray({ control: items.control });

        return items.map(fields, (field, item) => [
          field.label,
          item.getValues(),
        ]);
      });

      expect(result.current).toEqual([
        ['a', { label: 'a' }],
        ['b', { label: 'b' }],
      ]);
    });

    it('should apply useWatch default values through the scope', () => {
      type Values = { user: { firstName?: string; lastName?: string } };

      const { result } = renderHook(() => {
        const form = useForm<Values>();
        const user = form.select('user');
        const person = user.select({ name: 'firstName' });

        return {
          names: useWatch({
            control: user.control,
            name: ['firstName', 'lastName'],
            defaultValue: { firstName: 'first', lastName: 'last' },
          }),
          person: useWatch({
            control: person.control,
            defaultValue: { name: 'name' },
          }),
        };
      });

      expect(result.current.names).toEqual(['first', 'last']);
      expect(result.current.person).toEqual({ name: 'name' });
    });

    it('should return the same selection from type helpers', () => {
      const { result } = renderHook(() =>
        useForm<FormValues>({ defaultValues }),
      );
      const user = result.current.select('user');

      expect(user.narrow()).toBe(user);
      expect(user.defined()).toBe(user);
      expect(user.cast()).toBe(user);
      expect(user.select()).toBe(user);
      expect(() => user.assert()).not.toThrow();
    });
  });
});

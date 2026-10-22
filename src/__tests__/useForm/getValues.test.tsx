import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { Controller } from '../../controller';
import type { UseFormReturn } from '../../types';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';
import { FormProvider, useFormContext } from '../../useFormContext';
import { useFormState } from '../../useFormState';
import noop from '../../utils/noop';

function DateValue(this: { $d: Date }, iso: string) {
  this.$d = new Date(iso);
}
DateValue.prototype.format = noop;
const createDate = (iso: string) => new (DateValue as any)(iso);

type FileAndDateValues = {
  name: string;
  date: unknown;
  avatar?: FileList;
  document?: File;
};

describe('getValues', () => {
  it('return defaultValues before inputs mounted', () => {
    let values;

    const Component = () => {
      const { getValues } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      values = getValues();

      return null;
    };

    const { rerender } = render(<Component />);

    expect(values).toEqual({
      test: 'test',
    });

    rerender(<Component />);

    expect(values).toEqual({
      test: 'test',
    });
  });

  it('call getFieldsValues and return all values', () => {
    const { result } = renderHook(() => useForm<{ test: string }>());
    result.current.register('test');
    result.current.setValue('test', 'test');
    expect(result.current.getValues()).toEqual({ test: 'test' });
  });

  it('get individual field value', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string }>({
        defaultValues: {
          test: '123',
        },
      }),
    );
    result.current.register('test');
    expect(result.current.getValues('test')).toEqual('123');
  });

  it('get all field values', () => {
    const values = {
      test: 'test',
      test1: 'test1',
      test2: 'test2',
    };
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string; test2: string }>({
        defaultValues: values,
      }),
    );
    result.current.register('test');
    result.current.register('test1');
    result.current.register('test2');

    result.current.setValue('test', 'test');
    result.current.setValue('test1', 'test1');
    result.current.setValue('test2', 'test2');

    expect(result.current.getValues(['test', 'test1', 'test2'])).toEqual([
      'test',
      'test1',
      'test2',
    ]);
  });

  it('get undefined when field not found', () => {
    const { result } = renderHook(() => useForm());

    expect(result.current.getValues('test')).toEqual(undefined);
  });

  it('return fresh containers while preserving nested value references', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          field: 'value',
          user: { name: 'test' },
          items: [{ value: 1 }],
        },
      }),
    );
    const { getValues } = result.current;
    const snapshot = getValues();
    const names = ['user', 'items'] as const;
    const selected = getValues(names);

    expect(snapshot).not.toBe(getValues());
    expect(snapshot.user).toBe(getValues('user'));
    expect(snapshot.items).toBe(getValues('items'));
    expect(selected).not.toBe(getValues(names));
    expect(selected[0]).toBe(snapshot.user);
    expect(selected[1]).toBe(snapshot.items);

    snapshot.field = 'changed outside the form';

    expect(getValues('field')).toBe('value');
  });

  it.each([
    { filter: 'dirtyFields', config: { dirtyFields: true } },
    { filter: 'touchedFields', config: { touchedFields: true } },
  ] as const)(
    'preserve form values when filtering with $filter',
    ({ config }) => {
      const { result } = renderHook(() =>
        useForm({
          defaultValues: {
            user: { name: 'test', note: 'unchanged' },
            items: [{ value: 1 }, { value: 2 }],
          },
        }),
      );

      act(() => {
        result.current.setValue('user.name', 'changed', {
          shouldDirty: true,
          shouldTouch: true,
        });
        result.current.setValue('items.1.value', 3, {
          shouldDirty: true,
          shouldTouch: true,
        });
      });

      const filtered = result.current.getValues(undefined, config);

      expect(filtered).toEqual({
        user: { name: 'changed' },
        items: [undefined, { value: 3 }],
      });

      filtered.user.name = 'changed outside the form';
      filtered.items[1].value = 4;

      expect(result.current.getValues()).toEqual({
        user: { name: 'changed', note: 'unchanged' },
        items: [{ value: 1 }, { value: 3 }],
      });
    },
  );

  it('get value from shallowFieldsStateRef by name', () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    expect(result.current.getValues('test')).toEqual('test');
  });

  it('get value from shallowFieldsStateRef by array', () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    expect(result.current.getValues(['test'])).toEqual(['test']);
  });

  it('get value from shallowFieldsStateRef', () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    expect(result.current.getValues()).toEqual({
      test: 'test',
    });
  });

  it('get value from default value by name when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues('test')).toEqual('default');
  });

  it('get value from default value by array when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues(['test'])).toEqual(['default']);
  });

  it('not get value from default value when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues()).toEqual({
      test: 'default',
    });
  });

  it('return defaultValues when inputs are not registered', () => {
    let data: unknown;

    const Component = () => {
      const { getValues } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      if (!data) {
        data = getValues();
      }

      return null;
    };

    render(<Component />);

    expect(data).toEqual({ test: 'test' });
  });

  it('return defaultValues deep merge with form values', async () => {
    let data: unknown;

    const Component = () => {
      const { getValues, register } = useForm({
        defaultValues: {
          test: {
            firstName: 'test',
            lastName: 'test',
            time: new Date('1999-09-09'),
            file: new File([''], 'filename'),
          },
        },
      });

      if (!data) {
        data = getValues();
      }

      return (
        <div>
          <input {...register('test.firstName')} />
          <button
            onClick={() => {
              data = getValues();
            }}
          >
            getValues
          </button>
        </div>
      );
    };

    render(<Component />);

    expect(data).toEqual({
      test: {
        firstName: 'test',
        lastName: 'test',
        time: new Date('1999-09-09'),
        file: new File([''], 'filename'),
      },
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1234',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    expect(data).toMatchObject({
      test: {
        firstName: '1234',
        lastName: 'test',
      },
    });
  });

  it('return mounted input value after async reset', async () => {
    let updatedValue: unknown;

    type FormValues = {
      firstName: string;
    };

    function Form() {
      const { handleSubmit, reset, getValues } = useFormContext();
      const { isDirty, isValid } = useFormState();

      return (
        <form
          onSubmit={handleSubmit(async (data) => {
            await Promise.resolve();
            reset(data);
          })}
        >
          <button
            type={'button'}
            onClick={() => {
              updatedValue = getValues();
            }}
          >
            getValues
          </button>
          <button type="submit" disabled={!isDirty || !isValid}>
            submit
          </button>

          <Controller
            name="firstName"
            rules={{ required: true }}
            render={({ field }) => <input {...field} />}
          />
        </form>
      );
    }

    function App() {
      const methods = useForm<FormValues>({
        defaultValues: {
          firstName: 'test',
        },
      });

      return (
        <FormProvider {...methods}>
          <Form />
        </FormProvider>
      );
    }

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    expect(screen.getByRole('button', { name: 'submit' })).toBeDisabled();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test2' },
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'submit' })).not.toBeDisabled(),
    );

    fireEvent.click(screen.getByRole('button', { name: 'getValues' }));

    expect(updatedValue).toEqual({
      firstName: 'test2',
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test3' },
    });

    expect(screen.getByRole('button', { name: 'submit' })).not.toBeDisabled();
  });

  it('only return the dirty entries of a field array', () => {
    let dirtyValues: unknown;

    const App = () => {
      const {
        register,
        control,
        getValues,
        formState: { dirtyFields },
      } = useForm({
        defaultValues: {
          records: [
            { name: 'test', note: 'note' },
            { name: 'test1', note: 'note1' },
          ],
        },
      });
      const { fields } = useFieldArray({ control, name: 'records' });

      return (
        <form>
          {fields.map((field, index) => (
            <input key={field.id} {...register(`records.${index}.name`)} />
          ))}
          <p>{JSON.stringify(dirtyFields)}</p>
          <button
            type={'button'}
            onClick={() => {
              dirtyValues = getValues(undefined, { dirtyFields: true });
            }}
          >
            getValues
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'changed' },
    });

    fireEvent.click(screen.getByRole('button'));

    expect(dirtyValues).toEqual({
      records: [undefined, { name: 'changed' }],
    });
  });

  it.each([
    {
      trigger: 'another field returns to its default value',
      change: () => {
        fireEvent.input(screen.getByRole('textbox'), {
          target: { value: 'x' },
        });
        fireEvent.input(screen.getByRole('textbox'), {
          target: { value: '' },
        });
      },
    },
    {
      trigger: 'setValue runs with shouldDirty',
      change: (methods: UseFormReturn<FileAndDateValues>) =>
        act(() =>
          methods.setValue('date', createDate('2024-03-01'), {
            shouldDirty: true,
          }),
        ),
    },
  ])(
    'keep file and date-library values whole in the dirty values when $trigger',
    ({ change }) => {
      const file = new File(['a'], 'a.pdf');
      const files = Object.create(FileList.prototype);
      Object.defineProperty(files, 0, { value: file, enumerable: true });
      Object.defineProperty(files, 'length', { value: 1 });
      let methods!: UseFormReturn<FileAndDateValues>;

      const App = () => {
        methods = useForm<FileAndDateValues>({
          defaultValues: { name: '', date: createDate('2024-01-01') },
        });

        return (
          <form>
            <input {...methods.register('name')} />
            <input
              type="file"
              data-testid="avatar"
              {...methods.register('avatar')}
            />
            <Controller
              control={methods.control}
              name="document"
              render={({ field }) => (
                <button type="button" onClick={() => field.onChange(file)}>
                  upload
                </button>
              )}
            />
            <Controller
              control={methods.control}
              name="date"
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(createDate('2024-02-15'))}
                >
                  pick
                </button>
              )}
            />
            <p>{JSON.stringify(methods.formState.dirtyFields)}</p>
          </form>
        );
      };

      render(<App />);

      fireEvent.change(screen.getByTestId('avatar'), { target: { files } });
      fireEvent.click(screen.getByRole('button', { name: 'upload' }));
      fireEvent.click(screen.getByRole('button', { name: 'pick' }));
      change(methods);

      expect(
        screen.getByText('{"avatar":true,"document":true,"date":true}'),
      ).toBeVisible();

      const dirtyValues = methods.getValues(undefined, { dirtyFields: true });

      expect(dirtyValues.avatar).toBe(files);
      expect(dirtyValues.document).toBe(file);
      expect(dirtyValues.date).toBeInstanceOf(DateValue);
    },
  );

  it('keep a date-library value in a field array row whole in the dirty values after an append', () => {
    let dirtyValues: Record<string, any> = {};

    const App = () => {
      const {
        control,
        getValues,
        formState: { dirtyFields },
      } = useForm({
        defaultValues: { items: [{ date: createDate('2024-01-01') }] },
      });
      const { fields, append } = useFieldArray({ control, name: 'items' });

      return (
        <form>
          {fields.map((item, index) => (
            <Controller
              key={item.id}
              control={control}
              name={`items.${index}.date`}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(createDate('2024-02-15'))}
                >
                  pick {index}
                </button>
              )}
            />
          ))}
          <button
            type="button"
            onClick={() => append({ date: createDate('2024-05-05') })}
          >
            append
          </button>
          <p>{JSON.stringify(dirtyFields)}</p>
          <button
            type="button"
            onClick={() => {
              dirtyValues = getValues(undefined, { dirtyFields: true });
            }}
          >
            getValues
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'pick 0' }));
    fireEvent.click(screen.getByRole('button', { name: 'append' }));
    fireEvent.click(screen.getByRole('button', { name: 'getValues' }));

    expect(
      screen.getByText('{"items":[{"date":true},{"date":true}]}'),
    ).toBeVisible();
    expect(dirtyValues.items[0].date).toBeInstanceOf(DateValue);
    expect(dirtyValues.items[1].date).toBeInstanceOf(DateValue);
  });
});

describe('getValues with an own hasOwnProperty field', () => {
  it('extracts dirty values without calling the field value', () => {
    const { result } = renderHook(() => {
      const methods = useForm({ defaultValues: { hasOwnProperty: 'before' } });
      methods.formState.dirtyFields;
      return methods;
    });
    result.current.register('hasOwnProperty');
    act(() => {
      result.current.setValue('hasOwnProperty', 'after', {
        shouldDirty: true,
      });
    });
    expect(result.current.getValues(undefined, { dirtyFields: true })).toEqual({
      hasOwnProperty: 'after',
    });
  });
});

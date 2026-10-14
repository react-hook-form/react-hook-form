import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { FieldArray, FormProvider, useForm } from '../';

type FormValues = {
  items: { value: string }[];
};

const defaultValues: FormValues = {
  items: [{ value: 'a' }, { value: 'b' }],
};

const getInputValues = () =>
  screen
    .queryAllByRole('textbox')
    .map((input) => (input as HTMLInputElement).value);

describe('FieldArray', () => {
  it('render the fields from defaultValues through render', () => {
    const App = () => {
      const { control, register } = useForm<FormValues>({ defaultValues });

      return (
        <FieldArray
          control={control}
          name="items"
          render={({ fields }) => (
            <>
              {fields.map((field, index) => (
                <input key={field.id} {...register(`items.${index}.value`)} />
              ))}
            </>
          )}
        />
      );
    };

    render(<App />);

    expect(getInputValues()).toEqual(['a', 'b']);
  });

  it('update the rendered list and submitted values with append and remove from render', async () => {
    const onSubmit = jest.fn();

    const App = () => {
      const { control, register, handleSubmit } = useForm<FormValues>({
        defaultValues,
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldArray
            control={control}
            name="items"
            render={({ fields, append, remove }) => (
              <>
                {fields.map((field, index) => (
                  <input key={field.id} {...register(`items.${index}.value`)} />
                ))}
                <button type="button" onClick={() => append({ value: 'c' })}>
                  append
                </button>
                <button type="button" onClick={() => remove(0)}>
                  remove
                </button>
              </>
            )}
          />
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    expect(getInputValues()).toEqual(['a', 'b', 'c']);

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    expect(getInputValues()).toEqual(['b', 'c']);

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { items: [{ value: 'b' }, { value: 'c' }] },
        expect.anything(),
      ),
    );
  });

  it('use the control from FormProvider when control is not passed', async () => {
    const onSubmit = jest.fn();

    const App = () => {
      const methods = useForm<FormValues>({ defaultValues });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <FieldArray
              name="items"
              render={({ fields, append }) => (
                <>
                  {fields.map((field, index) => (
                    <input
                      key={field.id}
                      {...methods.register(`items.${index}.value`)}
                    />
                  ))}
                  <button type="button" onClick={() => append({ value: 'c' })}>
                    append
                  </button>
                </>
              )}
            />
            <button>submit</button>
          </form>
        </FormProvider>
      );
    };

    render(<App />);

    expect(getInputValues()).toEqual(['a', 'b']);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    expect(getInputValues()).toEqual(['a', 'b', 'c']);

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { items: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] },
        expect.anything(),
      ),
    );
  });
});

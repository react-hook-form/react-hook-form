import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';
import { useFormDebug } from '../useFormDebug';

describe('useFormDebug', () => {
  it('should return formState with all properties', () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          test: '',
        },
      });
      const { formState } = useFormDebug({ control });

      return (
        <div>
          <input {...register('test')} />
          <p data-testid="isDirty">{formState.isDirty ? 'dirty' : 'clean'}</p>
          <p data-testid="isValid">{formState.isValid ? 'valid' : 'invalid'}</p>
        </div>
      );
    };

    render(<Component />);

    expect(screen.getByTestId('isDirty')).toHaveTextContent('clean');
    expect(screen.getByTestId('isValid')).toHaveTextContent('valid');
  });

  it('should return current form values', async () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          name: 'initial',
        },
      });
      const { values } = useFormDebug({ control });

      return (
        <div>
          <input {...register('name')} />
          <p data-testid="values">{values.name}</p>
        </div>
      );
    };

    render(<Component />);

    expect(screen.getByTestId('values')).toHaveTextContent('initial');

    fireEvent.input(screen.getByRole('textbox'), {
      target: { value: 'updated' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('values')).toHaveTextContent('updated');
    });
  });

  it('should return registered field names', async () => {
    const Component = () => {
      const { register, control } = useForm();
      const { registeredFields } = useFormDebug({ control });

      return (
        <div>
          <input {...register('firstName')} />
          <input {...register('lastName')} />
          <p data-testid="fields">{registeredFields.join(',')}</p>
        </div>
      );
    };

    render(<Component />);

    await waitFor(() => {
      expect(screen.getByTestId('fields')).toHaveTextContent(
        'firstName,lastName',
      );
    });
  });

  it('should return field array names', async () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          items: [{ name: 'test' }],
        },
      });
      const { fields } = useFieldArray({ control, name: 'items' });
      const { fieldArrays } = useFormDebug({ control });

      return (
        <div>
          {fields.map((field, index) => (
            <input key={field.id} {...register(`items.${index}.name`)} />
          ))}
          <p data-testid="arrays">{fieldArrays.join(',')}</p>
        </div>
      );
    };

    render(<Component />);

    await waitFor(() => {
      expect(screen.getByTestId('arrays')).toHaveTextContent('items');
    });
  });

  it('should track render count', () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          test: '',
        },
      });
      const { renderCount } = useFormDebug({ control });

      return (
        <div>
          <input {...register('test')} />
          <p data-testid="count">{renderCount}</p>
        </div>
      );
    };

    render(<Component />);

    // The render count should be a positive number after initial render
    const count = parseInt(screen.getByTestId('count').textContent || '0');
    expect(count).toBeGreaterThan(0);
  });

  it('should work with FormProvider', () => {
    const Child = () => {
      const { formState, values } = useFormDebug();

      return (
        <div>
          <p data-testid="isDirty">{formState.isDirty ? 'dirty' : 'clean'}</p>
          <p data-testid="name">{values.name}</p>
        </div>
      );
    };

    const Component = () => {
      const methods = useForm({
        defaultValues: {
          name: 'test',
        },
      });

      return (
        <FormProvider {...methods}>
          <input {...methods.register('name')} />
          <Child />
        </FormProvider>
      );
    };

    render(<Component />);

    expect(screen.getByTestId('isDirty')).toHaveTextContent('clean');
    expect(screen.getByTestId('name')).toHaveTextContent('test');
  });

  it('should update formState when form becomes dirty', async () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          test: '',
        },
      });
      const { formState } = useFormDebug({ control });

      return (
        <div>
          <input {...register('test')} />
          <p data-testid="isDirty">{formState.isDirty ? 'dirty' : 'clean'}</p>
        </div>
      );
    };

    render(<Component />);

    expect(screen.getByTestId('isDirty')).toHaveTextContent('clean');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'changed' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('isDirty')).toHaveTextContent('dirty');
    });
  });

  it('should show errors in formState', async () => {
    const Component = () => {
      const { register, control, handleSubmit } = useForm({
        defaultValues: {
          test: '',
        },
      });
      const { formState } = useFormDebug({ control });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('test', { required: 'Required' })} />
          <p data-testid="hasError">
            {formState.errors.test ? 'error' : 'no-error'}
          </p>
          <button type="submit">Submit</button>
        </form>
      );
    };

    render(<Component />);

    expect(screen.getByTestId('hasError')).toHaveTextContent('no-error');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('hasError')).toHaveTextContent('error');
    });
  });
});

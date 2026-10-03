import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Controller } from '../controller';
import type { UseFormReturn } from '../types';
import { useForm } from '../useForm';

describe('Controller blur after reset', () => {
  it('validates a mounted field without requiring a value change or render', async () => {
    let form: UseFormReturn<{ name: string }>;
    const validate = jest.fn((value: string) => !!value || 'Name required');
    const Field = React.memo(
      ({ control }: Pick<UseFormReturn<{ name: string }>, 'control'>) => (
        <Controller
          control={control}
          name="name"
          rules={{ validate }}
          render={({ field }) => <input aria-label="Name" {...field} />}
        />
      ),
    );
    Field.displayName = 'ResetField';
    const App = () => {
      form = useForm({ mode: 'onTouched', defaultValues: { name: '' } });
      return <Field control={form.control} />;
    };
    render(<App />);
    act(() => form.reset({ name: '' }));
    await act(async () => fireEvent.blur(screen.getByLabelText('Name')));
    expect(validate).toHaveBeenCalledWith('', { name: '' });
    expect(form!.getFieldState('name').error?.message).toBe('Name required');
  });
});

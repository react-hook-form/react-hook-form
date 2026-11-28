import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { DevTool } from 'react-hook-form/devtools';
import type { Placement } from 'react-hook-form/devtools';
import { useSearchParams } from 'react-router-dom';

type FormValues = {
  firstName: string;
  age: number;
  role: string;
  subscribe: boolean;
  contact: string;
  address: { city: string };
  custom: string;
  items: { name: string }[];
};

const DevToolPage = () => {
  const [searchParams] = useSearchParams();
  const { register, control, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      firstName: 'bill',
      role: 'admin',
      contact: 'email',
      address: { city: '' },
      custom: '',
      items: [{ name: 'item' }],
    },
  });
  const { fields, append } = useFieldArray({ control, name: 'items' });

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input
        {...register('firstName', { required: 'First name is required' })}
        placeholder="firstName"
      />
      <input
        type="number"
        {...register('age', { valueAsNumber: true, min: 18 })}
        placeholder="age"
      />
      <select {...register('role')}>
        <option value="admin">admin</option>
        <option value="user">user</option>
      </select>
      <label>
        <input type="checkbox" {...register('subscribe')} /> subscribe
      </label>
      <label>
        <input type="radio" value="email" {...register('contact')} /> email
      </label>
      <label>
        <input type="radio" value="phone" {...register('contact')} /> phone
      </label>
      <input
        {...register('address.city', { required: 'City is required' })}
        placeholder="address.city"
      />
      <Controller
        control={control}
        name="custom"
        render={({ field }) => (
          <input
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder="custom"
          />
        )}
      />
      {fields.map((field, index) => (
        <input
          key={field.id}
          {...register(`items.${index}.name`)}
          placeholder={`items.${index}.name`}
        />
      ))}
      <button type="button" onClick={() => append({ name: '' })}>
        append
      </button>
      <button>submit</button>
      <DevTool
        control={control}
        placement={(searchParams.get('placement') as Placement) || undefined}
      />
    </form>
  );
};

export default DevToolPage;

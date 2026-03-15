import React, { memo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FieldError from './FieldError';
import type { UserProfileFormValues } from './UserProfileForm';

const ContactSection: React.FC = memo(() => {
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = useFormContext<UserProfileFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'phoneNumbers',
  });

  return (
    <fieldset disabled={isSubmitting}>
      <legend>联系方式</legend>

      <div>
        <label>Email</label>
        <input
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format',
            },
          })}
          placeholder="you@example.com"
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <label>Phone Numbers</label>

        {fields.map((field, index) => (
          <div
            key={field.id}
            style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}
          >
            <input
              {...register(`phoneNumbers.${index}.number` as const, {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9+\-()\s]{6,20}$/,
                  message: 'Invalid phone format',
                },
              })}
              placeholder="Phone number"
            />

            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length <= 1}
            >
              Remove
            </button>

            <FieldError
              message={errors.phoneNumbers?.[index]?.number?.message}
            />
          </div>
        ))}

        <button type="button" onClick={() => append({ number: '' })}>
          Add Phone Number
        </button>
      </div>
    </fieldset>
  );
});

export default ContactSection;

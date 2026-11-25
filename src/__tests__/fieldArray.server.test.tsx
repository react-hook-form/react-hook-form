import React from 'react';
import { renderToString } from 'react-dom/server';

import { FieldArray } from '../fieldArray';
import { useForm } from '../useForm';

describe('FieldArray with SSR', () => {
  it('be rendered correctly', () => {
    const Component = () => {
      const { control } = useForm({
        defaultValues: { test: [{ value: 'one' }, { value: 'two' }] },
      });

      return (
        <FieldArray
          control={control}
          name="test"
          render={({ fields }) => (
            <ul>
              {fields.map((field, index) => (
                <li key={field.id}>{index}</li>
              ))}
            </ul>
          )}
        />
      );
    };

    expect(renderToString(<Component />)).toBe('<ul><li>0</li><li>1</li></ul>');
  });
});

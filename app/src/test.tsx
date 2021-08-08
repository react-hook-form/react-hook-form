// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';

type FormValues = {
  nest: {
    test: {
      value: string;
      nestedArray: {
        value: string;
      }[];
    }[];
  };
};
const ChildComponent = ({
  index,
  control,
}: {
  control: Control<FormValues>;
  index: number;
}) => {
  const { fields } = useFieldArray<FormValues>({
    name: `nest.test.${index}.nestedArray` as const,
    control,
  });

  return (
    <div>
      {fields.map((item, i) => (
        <input
          key={item.id}
          {...control.register(
            `nest.test.${index}.nestedArray.${i}.value` as const,
          )}
        />
      ))}
    </div>
  );
};

function App() {
  const { register, control } = useForm<FormValues>();
  const { fields, insert } = useFieldArray({
    control,
    name: 'test',
  });

  return (
    <div>
      <form>
        {fields.map((field, index) => {
          return (
            <fieldset key={field.id}>
              <input {...register(`test.${index}.name`)} />
            </fieldset>
          );
        })}
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          let formData = new FormData(target);

          setTimeout(() => {
            insert(0, {
              name: formData.get('name'),
            });
          }, 1000);

          target.reset();
        }}
      >
        <input name="name" data-testid="input" />
        <button>submit</button>
      </form>
    </div>
  );
}
export default App;

import React, { useEffect } from 'react';
import { useForm } from '@bombillazo/rhf-plus';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  items: yup.array().min(1, 'Items must have at least one item').required(),
  nested: yup.object({
    tags: yup.array().min(1, 'Tags must have at least one tag').required(),
  }),
  deep: yup.object({
    level: yup.object({
      values: yup.array().min(1, 'Values cannot be empty').required(),
    }),
  }),
});

type FormData = {
  items: string[];
  nested: {
    tags: string[];
  };
  deep: {
    level: {
      values: string[];
    };
  };
};

let renderCounter = 0;

const EmptyArrayValidation: React.FC = () => {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      items: ['item1', 'item2'],
      nested: {
        tags: ['tag1', 'tag2'],
      },
      deep: {
        level: {
          values: ['value1', 'value2'],
        },
      },
    },
  });

  renderCounter++;

  const clearItems = () => {
    setValue('items', [], { shouldValidate: true });
  };

  const clearTags = () => {
    setValue('nested.tags', [], { shouldValidate: true });
  };

  const clearDeepValues = () => {
    setValue('deep.level.values', [], { shouldValidate: true });
  };

  const setNewItems = () => {
    setValue('items', ['new1', 'new2'], { shouldValidate: true });
  };

  const manualValidate = () => {
    trigger();
  };

  return (
    <form onSubmit={handleSubmit(() => {})}>
      <div>
        <h3>Items Array</h3>
        <input {...register('items.0')} placeholder="Item 0" />
        <input {...register('items.1')} placeholder="Item 1" />
        {errors.items && <p id="items-error">{errors.items.message}</p>}
        <button type="button" id="clear-items" onClick={clearItems}>
          Clear Items
        </button>
        <button type="button" id="set-items" onClick={setNewItems}>
          Set New Items
        </button>
      </div>

      <div>
        <h3>Nested Tags Array</h3>
        <input {...register('nested.tags.0')} placeholder="Tag 0" />
        <input {...register('nested.tags.1')} placeholder="Tag 1" />
        {errors.nested?.tags && (
          <p id="tags-error">{errors.nested.tags.message}</p>
        )}
        <button type="button" id="clear-tags" onClick={clearTags}>
          Clear Tags
        </button>
      </div>

      <div>
        <h3>Deep Nested Values Array</h3>
        <input {...register('deep.level.values.0')} placeholder="Value 0" />
        <input {...register('deep.level.values.1')} placeholder="Value 1" />
        {errors.deep?.level?.values && (
          <p id="deep-error">{errors.deep.level.values.message}</p>
        )}
        <button type="button" id="clear-deep" onClick={clearDeepValues}>
          Clear Deep Values
        </button>
      </div>

      <button type="button" id="validate" onClick={manualValidate}>
        Validate All
      </button>
      <button type="submit" id="submit">
        Submit
      </button>
      <div id="renderCount">Render count: {renderCounter}</div>
    </form>
  );
};

export default EmptyArrayValidation;

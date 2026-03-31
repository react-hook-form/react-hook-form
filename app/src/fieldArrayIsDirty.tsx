import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';

type FormValues = {
  data: { id: number; name: string }[];
};

const defaultValues: FormValues = {
  data: [{ id: 1, name: 'a' }],
};

/**
 * Example demonstrating correct isDirty behavior with useFieldArray.remove()
 *
 * Key points:
 * 1. Do NOT call form.reset() in useEffect on mount - it interferes with dirty tracking
 * 2. Access formState.isDirty directly to ensure proper subscription
 * 3. Removing the only default item correctly sets isDirty to true
 */
export default function FieldArrayIsDirty() {
  const form = useForm<FormValues>({ defaultValues });

  // Access formState directly to ensure proper subscription
  const { isDirty } = form.formState;

  const fieldArray = useFieldArray({ control: form.control, name: 'data' });

  const handleDelete = (index: number) => {
    fieldArray.remove(index);
  };

  const handleAdd = () => {
    const newId =
      Math.max(0, ...fieldArray.fields.map((f: { id: number }) => f.id)) + 1;
    fieldArray.append({ id: newId, name: '' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Field Array isDirty Example</h1>

      <div style={{ marginBottom: '20px' }}>
        {fieldArray.fields.map((field: { id: number }, index: number) => (
          <div key={field.id} style={{ marginBottom: '10px' }}>
            <input
              {...form.register(`data.${index}.name`)}
              placeholder="Enter name"
              style={{ marginRight: '10px' }}
            />
            <button type="button" onClick={() => handleDelete(index)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        style={{ marginBottom: '20px' }}
      >
        Add Item
      </button>

      <div
        style={{
          padding: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
        }}
      >
        <div>
          <strong>isDirty:</strong> {String(isDirty)}
        </div>
        <div>
          <strong>Items count:</strong> {fieldArray.fields.length}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#e8f4f8',
          borderRadius: '4px',
        }}
      >
        <h3>Instructions:</h3>
        <ol>
          <li>Initially: 1 item with name "a", isDirty = false</li>
          <li>Click "Delete" on the item</li>
          <li>✓ isDirty becomes true (array changed from [item] to [])</li>
          <li>Click "Add Item" - isDirty remains true</li>
          <li>
            Type "a" in the new input - isDirty becomes false (matches
            defaultValues)
          </li>
        </ol>
      </div>

      <button
        type="button"
        onClick={() => {
          console.log('Current values:', form.getValues());
          console.log('isDirty:', isDirty);
          console.log('Default values:', defaultValues);
        }}
        style={{ marginTop: '20px' }}
      >
        Log Form State
      </button>
    </div>
  );
}

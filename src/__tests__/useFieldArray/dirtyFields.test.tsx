import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

let i = 0;

jest.mock('../../logic/generateId', () => () => String(i++));

/**
 * Comprehensive tests for useFieldArray dirtyFields bug
 * Related issues:
 * - #13054: append/remove marks entire defaultValues as dirty
 * - #11402: dirtyFields incorrect including unchanged fields after list updates
 * - #7197:  useFieldArray changes make all fields dirtyFields
 * - #9932:  dirty fields not cleaned properly after remove
 */
describe('useFieldArray dirtyFields isolation', () => {
  beforeEach(() => {
    i = 0;
  });

  // =========================================================
  // Scenario 1: items만 건드렸을 때 (append)
  // name, age는 dirtyFields에 포함되면 안 됨
  // =========================================================
  it('should only mark items dirty when only items field array is appended', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        age: number;
        items: { value: string }[];
      }>({
        defaultValues: {
          name: 'John',
          age: 30,
          items: [],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'items',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} />
          <input {...register('age')} />
          {fields.map((field, i) => (
            <input key={field.id} {...register(`items.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => append({ value: 'new' })}>
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/ }));

    await waitFor(() => {
      expect(dirtyResult).toEqual({
        items: [{ value: true }],
      });
      expect(dirtyResult).not.toHaveProperty('name');
      expect(dirtyResult).not.toHaveProperty('age');
    });
  });

  // =========================================================
  // Scenario 2: name과 items 둘 다 건드렸을 때
  // name: true, items: dirty — age는 포함되면 안 됨
  // =========================================================
  it('should mark both name and items dirty when both are modified', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        age: number;
        items: { value: string }[];
      }>({
        defaultValues: {
          name: 'John',
          age: 30,
          items: [],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'items',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} />
          <input {...register('age')} />
          {fields.map((field, i) => (
            <input key={field.id} {...register(`items.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => append({ value: 'new' })}>
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    // 1. name 필드 변경
    fireEvent.input(screen.getAllByRole('textbox')[0], {
      target: { value: 'Bob' },
    });

    // 2. items 배열에 append
    fireEvent.click(screen.getByRole('button', { name: /append/ }));

    await waitFor(() => {
      expect(dirtyResult).toHaveProperty('name', true);
      expect(dirtyResult).toHaveProperty('items');
      expect(dirtyResult).not.toHaveProperty('age');
    });
  });

  // =========================================================
  // Scenario 3: 두 개의 필드 배열 중 하나만 건드렸을 때
  // items_copy만 append → items, name, age는 포함 안 됨
  // =========================================================
  it('should only mark items_copy dirty when only items_copy is appended (multiple field arrays)', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        age: number;
        items: { value: string }[];
        items_copy: { value: string; value2: string }[];
      }>({
        defaultValues: {
          name: 'John',
          age: 30,
          items: [],
          items_copy: [],
        },
      });
      const itemsArray = useFieldArray({ control, name: 'items' });
      const itemsCopyArray = useFieldArray({ control, name: 'items_copy' });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} />
          <input {...register('age')} />
          {itemsArray.fields.map((field, i) => (
            <input key={field.id} {...register(`items.${i}.value` as const)} />
          ))}
          {itemsCopyArray.fields.map((field, i) => (
            <div key={field.id}>
              <input {...register(`items_copy.${i}.value` as const)} />
              <input {...register(`items_copy.${i}.value2` as const)} />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              itemsCopyArray.append({ value: 'new', value2: 'new2' })
            }
          >
            appendCopy
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /appendCopy/ }));

    await waitFor(() => {
      expect(dirtyResult).toEqual({
        items_copy: [{ value: true, value2: true }],
      });
      expect(dirtyResult).not.toHaveProperty('name');
      expect(dirtyResult).not.toHaveProperty('age');
      expect(dirtyResult).not.toHaveProperty('items');
    });
  });

  // =========================================================
  // Scenario 4: 두 개의 필드 배열 둘 다 건드렸을 때
  // items와 items_copy 모두 append → name, age는 포함 안 됨
  // =========================================================
  it('should mark both field arrays dirty when both are appended', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        age: number;
        items: { value: string }[];
        items_copy: { value: string; value2: string }[];
      }>({
        defaultValues: {
          name: 'John',
          age: 30,
          items: [],
          items_copy: [],
        },
      });
      const itemsArray = useFieldArray({ control, name: 'items' });
      const itemsCopyArray = useFieldArray({ control, name: 'items_copy' });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} />
          <input {...register('age')} />
          {itemsArray.fields.map((field, i) => (
            <input key={field.id} {...register(`items.${i}.value` as const)} />
          ))}
          {itemsCopyArray.fields.map((field, i) => (
            <div key={field.id}>
              <input {...register(`items_copy.${i}.value` as const)} />
              <input {...register(`items_copy.${i}.value2` as const)} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => itemsArray.append({ value: 'item1' })}
          >
            appendItems
          </button>
          <button
            type="button"
            onClick={() =>
              itemsCopyArray.append({ value: 'copy1', value2: 'copy2' })
            }
          >
            appendCopy
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /appendItems/ }));
    fireEvent.click(screen.getByRole('button', { name: /appendCopy/ }));

    await waitFor(() => {
      expect(dirtyResult).toHaveProperty('items');
      expect(dirtyResult).toHaveProperty('items_copy');
      expect(dirtyResult).not.toHaveProperty('name');
      expect(dirtyResult).not.toHaveProperty('age');
    });
  });

  // =========================================================
  // Scenario 5: name과 items_copy만 건드렸을 때
  // name 변경 + items_copy append → age, items는 포함 안 됨
  // =========================================================
  it('should mark name and items_copy dirty when both are modified, leaving age and items clean', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        age: number;
        items: { value: string }[];
        items_copy: { value: string; value2: string }[];
      }>({
        defaultValues: {
          name: 'John',
          age: 30,
          items: [],
          items_copy: [],
        },
      });
      const itemsArray = useFieldArray({ control, name: 'items' });
      const itemsCopyArray = useFieldArray({ control, name: 'items_copy' });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} data-testid="name" />
          <input {...register('age')} />
          {itemsArray.fields.map((field, i) => (
            <input key={field.id} {...register(`items.${i}.value` as const)} />
          ))}
          {itemsCopyArray.fields.map((field, i) => (
            <div key={field.id}>
              <input {...register(`items_copy.${i}.value` as const)} />
              <input {...register(`items_copy.${i}.value2` as const)} />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              itemsCopyArray.append({ value: 'copy1', value2: 'copy2' })
            }
          >
            appendCopy
          </button>
        </form>
      );
    };

    render(<Component />);

    // 1. name 필드 변경
    fireEvent.input(screen.getByTestId('name'), {
      target: { value: 'Alice' },
    });

    // 2. items_copy만 append
    fireEvent.click(screen.getByRole('button', { name: /appendCopy/ }));

    await waitFor(() => {
      expect(dirtyResult).toHaveProperty('name', true);
      expect(dirtyResult).toHaveProperty('items_copy');
      expect(dirtyResult).not.toHaveProperty('age');
      expect(dirtyResult).not.toHaveProperty('items');
    });
  });

  // =========================================================
  // Scenario 6: 중첩 필드 배열 (Issue #13054 원본 시나리오)
  // nonusservices.VATFiling_list append → name, age 포함 안 됨
  // =========================================================
  it('should not mark unrelated fields dirty with nested field array path', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        age: number;
        nonusservices: {
          VATFiling_list: { id: string; value: string }[];
        };
      }>({
        defaultValues: {
          name: 'John Doe',
          age: 30,
          nonusservices: {
            VATFiling_list: [{ id: '1', value: 'Item 1' }],
          },
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'nonusservices.VATFiling_list',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} />
          <input {...register('age')} />
          {fields.map((field, i) => (
            <div key={field.id}>
              <input
                {...register(`nonusservices.VATFiling_list.${i}.id` as const)}
              />
              <input
                {...register(
                  `nonusservices.VATFiling_list.${i}.value` as const,
                )}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ id: '2', value: 'Item 2' })}
          >
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/ }));

    await waitFor(() => {
      expect(dirtyResult).not.toHaveProperty('name');
      expect(dirtyResult).not.toHaveProperty('age');
      expect(dirtyResult).toHaveProperty('nonusservices');
    });
  });

  // =========================================================
  // Scenario 7: remove 후에도 관련 없는 필드 dirty 안 됨
  // (Issue #9932, #11402 관련)
  // =========================================================
  it('should not mark unrelated fields dirty after remove operation', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        title: string;
        description: string;
        tags: { label: string }[];
      }>({
        defaultValues: {
          title: 'My Post',
          description: 'Some description',
          tags: [{ label: 'react' }, { label: 'typescript' }],
        },
      });
      const { fields, remove } = useFieldArray({
        control,
        name: 'tags',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('title')} />
          <input {...register('description')} />
          {fields.map((field, i) => (
            <div key={field.id}>
              <input {...register(`tags.${i}.label` as const)} />
              <button type="button" onClick={() => remove(i)}>
                remove{i}
              </button>
            </div>
          ))}
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /remove0/ }));

    await waitFor(() => {
      expect(dirtyResult).not.toHaveProperty('title');
      expect(dirtyResult).not.toHaveProperty('description');
      expect(dirtyResult).toHaveProperty('tags');
    });
  });

  // =========================================================
  // Scenario 8: append 후 remove로 원래 상태로 돌아간 경우
  // user-modified name은 dirty로 유지되어야 함
  // =========================================================
  it('should preserve name dirty state after append then remove reverts array', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        name: string;
        items: { value: string }[];
      }>({
        defaultValues: {
          name: 'John',
          items: [{ value: 'original' }],
        },
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'items',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('name')} data-testid="name" />
          {fields.map((field, i) => (
            <input key={field.id} {...register(`items.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => append({ value: 'new' })}>
            append
          </button>
          <button type="button" onClick={() => remove(fields.length - 1)}>
            removeLast
          </button>
        </form>
      );
    };

    render(<Component />);

    // 1. name 변경
    fireEvent.input(screen.getByTestId('name'), {
      target: { value: 'Changed' },
    });

    await waitFor(() => {
      expect(dirtyResult).toHaveProperty('name', true);
    });

    // 2. append → name은 여전히 dirty
    fireEvent.click(screen.getByRole('button', { name: /append/ }));

    await waitFor(() => {
      expect(dirtyResult).toHaveProperty('name', true);
      expect(dirtyResult).toHaveProperty('items');
    });

    // 3. removeLast → 배열은 원래대로, name은 여전히 dirty
    fireEvent.click(screen.getByRole('button', { name: /removeLast/ }));

    await waitFor(() => {
      expect(dirtyResult).toHaveProperty('name', true);
    });
  });

  // =========================================================
  // Scenario 9: 여러 번 append해도 관련 없는 필드 오염 안 됨
  // (Issue #11402 시나리오)
  // =========================================================
  it('should not pollute unrelated fields after multiple appends', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        email: string;
        phone: string;
        addresses: { street: string; city: string }[];
      }>({
        defaultValues: {
          email: 'john@example.com',
          phone: '123-456',
          addresses: [],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'addresses',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('email')} />
          <input {...register('phone')} />
          {fields.map((field, i) => (
            <div key={field.id}>
              <input {...register(`addresses.${i}.street` as const)} />
              <input {...register(`addresses.${i}.city` as const)} />
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ street: '', city: '' })}
          >
            addAddress
          </button>
        </form>
      );
    };

    render(<Component />);

    // 3번 연속 append
    fireEvent.click(screen.getByRole('button', { name: /addAddress/ }));
    fireEvent.click(screen.getByRole('button', { name: /addAddress/ }));
    fireEvent.click(screen.getByRole('button', { name: /addAddress/ }));

    await waitFor(() => {
      expect(dirtyResult).not.toHaveProperty('email');
      expect(dirtyResult).not.toHaveProperty('phone');
      expect(dirtyResult).toHaveProperty('addresses');
      expect((dirtyResult as any).addresses).toHaveLength(3);
    });
  });

  // =========================================================
  // Scenario 10: 큰 폼에서 필드 배열 조작
  // 많은 필드가 있을 때 하나의 배열만 건드리면 나머지 전부 깨끗해야 함
  // =========================================================
  it('should isolate dirty state in large forms with many fields', async () => {
    let dirtyResult = {};
    const Component = () => {
      const {
        register,
        control,
        formState: { dirtyFields },
      } = useForm<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        company: string;
        todos: { task: string }[];
      }>({
        defaultValues: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          phone: '555-1234',
          company: 'Acme',
          todos: [],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'todos',
      });

      dirtyResult = dirtyFields;

      return (
        <form>
          <input {...register('firstName')} />
          <input {...register('lastName')} />
          <input {...register('email')} />
          <input {...register('phone')} />
          <input {...register('company')} />
          {fields.map((field, i) => (
            <input key={field.id} {...register(`todos.${i}.task` as const)} />
          ))}
          <button type="button" onClick={() => append({ task: 'New todo' })}>
            addTodo
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /addTodo/ }));

    await waitFor(() => {
      expect(dirtyResult).not.toHaveProperty('firstName');
      expect(dirtyResult).not.toHaveProperty('lastName');
      expect(dirtyResult).not.toHaveProperty('email');
      expect(dirtyResult).not.toHaveProperty('phone');
      expect(dirtyResult).not.toHaveProperty('company');
      expect(dirtyResult).toHaveProperty('todos');
    });
  });
});

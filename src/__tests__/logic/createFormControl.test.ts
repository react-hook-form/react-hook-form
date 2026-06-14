import { createFormControl } from '../../logic/createFormControl';
import isEmptyObject from '../../utils/isEmptyObject';

jest.mock('../../utils/isEmptyObject', () => {
  const original = jest.requireActual('../../utils/isEmptyObject');
  return {
    __esModule: true,
    default: jest.fn(original.default),
  };
});

describe('createFormControl', () => {
  it('should call `executeBuiltInValidation` once for a single field', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: 'foo',
      },
    });

    register('foo', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(1);
  });

  it('should call `executeBuiltInValidation` twice for a field as an object with a single sub-field', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: {
          bar: 'bar',
        },
      },
    });

    register('foo.bar', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(2);
  });

  it('should call executeBuiltInValidation the correct number of times in case the field is an array', async () => {
    const { register, control } = createFormControl({
      defaultValues: {
        foo: [
          {
            bar: 'bar',
            baz: 'baz',
          },
          {
            bar: 'bar',
            baz: 'baz',
          },
        ],
      },
    });

    register('foo.1.bar', {});

    await control._setValid(true);

    expect(isEmptyObject).toHaveBeenCalledTimes(3);
  });

  describe('field array onChange should not create empty objects', () => {
    it('should not update formValues when field array index is out of bounds', async () => {
      const { register, control, setValue } = createFormControl({
        defaultValues: {
          items: [{ name: 'Item 0' }, { name: 'Item 1' }],
        },
      });

      // Register fields for both items
      register('items.0.name');
      register('items.1.name');

      // Add items to the array names set (simulating useFieldArray)
      control._names.array.add('items');

      // Set initial values
      setValue('items', [{ name: 'Item 0' }, { name: 'Item 1' }]);

      // Simulate removing the first item using _setFieldArray
      control._setFieldArray('items', [{ name: 'Item 1' }]);

      // Now simulate an onChange event from the OLD items.1.name field
      // This field should not update formValues because index 1 is now out of bounds

      // Get the field and simulate onChange
      const field = control._fields['items.1.name'];
      if (field?._f) {
        await control._subjects.state.next({
          name: 'items.1.name',
          type: 'change',
        } as any);
      }

      // The formValues should still have only 1 item, not 2
      const formValues = control._formValues;
      expect(formValues.items).toHaveLength(1);
      expect(formValues.items[0]).toEqual({ name: 'Item 1' });
      // There should be no items[1]
      expect(formValues.items[1]).toBeUndefined();
    });
  });
});

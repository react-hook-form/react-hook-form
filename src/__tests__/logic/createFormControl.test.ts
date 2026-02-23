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

  describe('isDirty state updates without subscription', () => {
    it('should keep _formState.isDirty up-to-date even when not subscribed', () => {
      const { register, control } = createFormControl({
        defaultValues: {
          name: '',
        },
      });

      expect(control._proxyFormState.isDirty).toBe(false);

      const ref = document.createElement('input');
      ref.name = 'name';
      const { onChange } = register('name', {});
      onChange({ target: { name: 'name', value: '' } });
      register('name', {}).ref(ref);

      expect(control._formState.isDirty).toBe(false);

      onChange({ target: { name: 'name', value: 'John' } });

      expect(control._formState.isDirty).toBe(true);
      expect(control._proxyFormState.isDirty).toBe(false);

      onChange({ target: { name: 'name', value: '' } });
      expect(control._formState.isDirty).toBe(false);
    });

    it('should correctly update isDirty when multiple fields change without subscription', () => {
      const { register, control } = createFormControl({
        defaultValues: {
          firstName: '',
          lastName: '',
        },
      });

      expect(control._proxyFormState.isDirty).toBe(false);

      const firstNameRef = document.createElement('input');
      firstNameRef.name = 'firstName';
      const { onChange: onChangeFirstName } = register('firstName', {});
      onChangeFirstName({ target: { name: 'firstName', value: '' } });
      register('firstName', {}).ref(firstNameRef);

      const lastNameRef = document.createElement('input');
      lastNameRef.name = 'lastName';
      const { onChange: onChangeLastName } = register('lastName', {});
      onChangeLastName({ target: { name: 'lastName', value: '' } });
      register('lastName', {}).ref(lastNameRef);

      onChangeFirstName({ target: { name: 'firstName', value: 'John' } });
      expect(control._formState.isDirty).toBe(true);
      expect(control._proxyFormState.isDirty).toBe(false);

      onChangeLastName({ target: { name: 'lastName', value: 'Doe' } });
      expect(control._formState.isDirty).toBe(true);

      onChangeFirstName({ target: { name: 'firstName', value: '' } });
      expect(control._formState.isDirty).toBe(true);

      onChangeLastName({ target: { name: 'lastName', value: '' } });
      expect(control._formState.isDirty).toBe(false);
    });
  });
});

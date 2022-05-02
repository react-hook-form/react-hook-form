import React from 'react';

import { Controller } from '../controller';
import {
  Auto,
  Control,
  FieldErrors,
  FieldPath,
  FieldValues,
  PathString,
  TypedFieldPath,
  UseFormRegister,
} from '../types';
import { useController } from '../useController';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { useWatch } from '../useWatch';
import { join, of } from '../utils';

test('should not throw type error with optional array fields', () => {
  type Thing = { id: string; name: string };

  interface FormData {
    name: string;
    things?: Array<{ name: string }>;
    items?: Array<Thing>;
  }

  function App() {
    const { control, register } = useForm<FormData>({
      defaultValues: { name: 'test' },
    });
    const { fields, append } = useFieldArray({ control, name: 'things' });
    const fieldArray = useFieldArray({ control, name: 'items' });

    return (
      <div className="App">
        <input {...register('name')} />

        <button onClick={() => append({ name: '' })}>Add</button>

        {fields.map((field, index) => (
          <div key={field.key}>
            <input {...register(`things.${index}.name`)} />
          </div>
        ))}
        {fieldArray.fields.map((item) => {
          return <div key={item.key}>{item.name}</div>;
        })}
      </div>
    );
  }

  App;
});

test('should work with optional field with Controller', () => {
  type FormValues = {
    firstName: string;
    lastName?: string;
  };

  function App() {
    const { control } = useForm<FormValues>();

    return (
      <div>
        <Controller
          name="firstName"
          defaultValue=""
          control={control}
          render={({ field: { value, onChange } }) => {
            return <input value={value} onChange={onChange} />;
          }}
        />
        <Controller
          name="lastName"
          defaultValue=""
          control={control}
          render={({ field: { value, onChange } }) => {
            return <input value={value} onChange={onChange} />;
          }}
        />
      </div>
    );
  }

  App;
});

test('should work with useWatch return correct array types', () => {
  type FormValues = {
    testString: string;
    testNumber: number;
    testObject: {
      testString: string;
      test1String: string;
    };
  };

  const App = () => {
    const { control } = useForm<FormValues>();
    const output: [
      FormValues['testString'],
      FormValues['testNumber'],
      FormValues['testObject'],
    ] = useWatch({
      control,
      name: ['testString', 'testNumber', 'testObject'],
    });

    return output;
  };

  App;
});

test('should type errors correctly with Path generic', () => {
  interface InputProps<T extends FieldValues = FieldValues> {
    name: FieldPath<T>;
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
  }

  function Input<T extends FieldValues = FieldValues>({
    name,
    register,
    errors,
  }: InputProps<T>) {
    return (
      <>
        <input {...register(name)} />
        {errors[name] ? errors?.[name]?.message : 'no error'}
      </>
    );
  }

  Input;
});

test('should allow unpackedValue and deep partial unpackValue for reset', () => {
  type Type1 = { name: string };
  type Type2 = { name: string };

  type Forms = {
    test: Type1;
    test1: Type2;
  };

  type FormMapKey = keyof Forms;

  const Test = <T extends FormMapKey>() => {
    const { reset, getValues } = useForm<Forms[T]>();
    reset(getValues());
  };

  Test;
});

test('should infer context type into control', () => {
  function App() {
    const [isValid] = React.useState(true);
    const { control } = useForm<{ test: {}[] }, { isValid: boolean }>({
      resolver: (data, context) => {
        return {
          values: context?.isValid ? data : {},
          errors: {},
        };
      },
      context: {
        isValid,
      },
    });

    useFieldArray({
      name: 'test',
      control,
    });

    return null;
  }

  App;
});

test('should work with useController with generic component', () => {
  type FormValues = {
    yourDetails: {
      firstName: string;
      lastName: string;
    };
    age: string;
    pet: { name: string }[];
  };

  type InputProps<T extends FieldValues, P extends PathString> = {
    control: Control<T>;
    name: Auto.TypedFieldPath<T, P, string>;
  };

  const Input = <T extends FieldValues, P extends PathString>(
    props: InputProps<T, P>,
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const { field } = useController({
      name: of(props.name),
      control: props.control,
    });
    const [value, setValue] = React.useState(field.value || '');

    return (
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          field.onChange(e.target.value);
        }}
        ref={ref}
      />
    );
  };

  function TextInput<T>(props: {
    control: Control<T>;
    name: TypedFieldPath<T, string>;
  }) {
    const {
      field: { onChange, value },
    } = useController({
      control: props.control,
      name: props.name,
    });
    return <input type="text" value={value} onChange={onChange} />;
  }

  type RegisterInput<T, P extends PathString> = {
    name: Auto.FieldPath<T, P>;
    register: UseFormRegister<T>;
  };

  function RegisterInput<T, P extends PathString>({
    register,
    name,
  }: RegisterInput<T, P>) {
    const ofName = of(name);
    return <input {...register(ofName)} />;
  }

  function App() {
    const { handleSubmit, control, register } = useForm<FormValues>({
      defaultValues: {
        yourDetails: {
          firstName: '',
          lastName: '',
        },
        age: '',
        pet: [],
      },
    });

    return (
      <div>
        <form onSubmit={handleSubmit(() => {})}>
          <Input name="age" control={control} />

          <RegisterInput register={register} name={'age'} />

          <TextInput<FormValues> name={of('age')} control={control} />

          <input type="submit" />
        </form>
      </div>
    );
  }

  App;
});

test('join should work in generic contexts', () => {
  interface Address {
    street: string;
    houseNumber: number;
    city: string;
    country: string;
  }

  interface Order {
    item: string;
    shippingAddress: Address;
    billingAddress: Address;
  }

  function AddressFields<T, P extends PathString>(props: {
    register: UseFormRegister<T>;
    path: Auto.TypedFieldPath<T, P, Address>;
  }) {
    const { register, path } = props;
    return (
      <div>
        <input type="text" {...register(join(path, 'street'))} />
        <input type="number" {...register(join(path, 'houseNumber'))} />
        <input type="text" {...register(join(path, 'city'))} />
        <input type="text" {...register(join(path, 'country'))} />
      </div>
    );
  }

  function AddressDisplay<T, P extends PathString>(props: {
    control: Control<T>;
    path: Auto.TypedFieldPath<T, P, Address>;
  }) {
    const { control, path } = props;
    const street = useWatch({ control, name: join(path, 'street') });
    const houseNumber = useWatch({ control, name: join(path, 'houseNumber') });
    const city = useWatch({ control, name: join(path, 'city') });
    const country = useWatch({ control, name: join(path, 'country') });

    return (
      <p>
        {street} {houseNumber}, {city}, {country}
      </p>
    );
  }

  const address: Address = {
    street: 'George St',
    houseNumber: 483,
    city: 'Sydney',
    country: 'Australia',
  };

  function App() {
    const { register, control } = useForm<Order>({
      defaultValues: {
        item: 'Foobar Plushy',
        shippingAddress: address,
        billingAddress: address,
      },
    });
    return (
      <div>
        <input type="text" {...register('item')} />
        <AddressFields register={register} path={'billingAddress'} />
        <AddressDisplay control={control} path={'billingAddress'} />
        <AddressFields register={register} path={'shippingAddress'} />
        <AddressDisplay control={control} path={'shippingAddress'} />
      </div>
    );
  }

  App;
});

test('branded types should be inferred from context', () => {
  interface TextFieldDescriptor<T extends FieldValues> {
    type: 'text';
    label: string;
    path: TypedFieldPath<T, string>;
  }

  interface NumberFieldDescriptor<T extends FieldValues> {
    type: 'number';
    label: string;
    path: TypedFieldPath<T, number>;
  }

  type FormDescriptor<T extends FieldValues> = Array<
    TextFieldDescriptor<T> | NumberFieldDescriptor<T>
  >;

  interface FooBar {
    foo: string;
    bar: number;
  }

  const fooBarForm: FormDescriptor<FooBar> = [
    { type: 'text', label: 'Foo', path: of('foo') },
    { type: 'number', label: 'Bar', path: of('bar') },
  ];

  function App() {
    const { register } = useForm<FooBar>({
      defaultValues: {
        foo: 'foo',
        bar: 42,
      },
    });

    return (
      <div>
        {fooBarForm.map(({ type, label, path }) => (
          <label key={path}>
            {label}
            <input type={type} {...register(path)} />
          </label>
        ))}
      </div>
    );
  }

  App;
});

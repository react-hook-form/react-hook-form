import { Controller } from '../controller';
import type {
  Control,
  FieldError,
  FieldErrors,
  FormSelection,
  LeafSelection,
  ObjectSelection,
  SelectionLeafControl,
  UseFormRegisterReturn,
} from '../types';
import { useController } from '../useController';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { useFormState } from '../useFormState';
import { useWatch } from '../useWatch';

import type { Equal, Expect } from './__fixtures__';

type FormValues = {
  title: string;
  age: number;
  isActive: boolean;
  birthday: Date;
  optional?: string;
  user: {
    firstName: string;
    address: {
      city: string;
    };
  };
  maybeUser?: {
    name: string;
  };
  items: { name: string; count: number }[];
  tags: string[];
  pet: { type: 'dog'; bark: boolean } | { type: 'cat'; meow: boolean };
};

/** {@link UseFormSelect} */ {
  /* eslint-disable react-hooks/rules-of-hooks */
  const form = useForm<FormValues>();

  /** it should select the whole form */ {
    const root = form.select();

    type _t1 = Expect<Equal<typeof root, ObjectSelection<FormValues>>>;
    type _t2 = Expect<Equal<typeof root.control, Control<FormValues>>>;
  }

  /** it should select an object */ {
    const user = form.select('user');

    type _t1 = Expect<Equal<typeof user, FormSelection<FormValues['user']>>>;
    type _t2 = Expect<Equal<typeof user.control, Control<FormValues['user']>>>;
    const firstName = user.getValues('firstName');
    type _t3 = Expect<Equal<typeof firstName, string>>;
    type _t4 = Expect<
      Equal<typeof user.formState.errors, FieldErrors<FormValues['user']>>
    >;

    user.register('firstName');
    user.register('address.city');
    user.setValue('address.city', 'sydney');
    user.trigger(['firstName', 'address.city']);
    user.clearErrors('firstName');
    user.resetField('firstName');
    user.setFocus('firstName');
    user.setError('address.city', { message: 'error' });

    // @ts-expect-error unknown relative name
    user.register('title');
    // @ts-expect-error full name is not relative
    user.register('user.firstName');
    // @ts-expect-error wrong value type
    user.setValue('firstName', 1);
  }

  /** it should select nested paths relative to a selection */ {
    const city = form.select('user').select('address.city');

    type _t1 = Expect<Equal<typeof city, LeafSelection<string>>>;
    type _t2 = Expect<Equal<ReturnType<typeof city.getValues>, string>>;
  }

  /** it should select primitives as leaves */ {
    const title = form.select('title');
    const age = form.select('age');
    const isActive = form.select('isActive');
    const birthday = form.select('birthday');
    const optional = form.select('optional');

    type _t1 = Expect<Equal<typeof title, LeafSelection<string>>>;
    type _t2 = Expect<Equal<typeof age, LeafSelection<number>>>;
    type _t3 = Expect<Equal<typeof isActive, LeafSelection<boolean>>>;
    type _t4 = Expect<Equal<typeof birthday, LeafSelection<Date>>>;
    type _t5 = Expect<
      Equal<typeof optional, LeafSelection<string | undefined>>
    >;
    type _t6 = Expect<
      Equal<typeof title.control, SelectionLeafControl<string>>
    >;
    type _t7 = Expect<
      Equal<ReturnType<typeof title.register>, UseFormRegisterReturn<string>>
    >;
    type _t8 = Expect<
      Equal<ReturnType<typeof title.getErrors>, FieldError | undefined>
    >;

    title.register({ required: true });
    title.trigger();
    title.clearErrors();
    title.setError({ type: 'custom' });
    title.resetField({ defaultValue: 'title' });

    // @ts-expect-error a leaf has no relative names
    title.select('length');
    // @ts-expect-error a leaf formState has no field maps
    title.formState.errors;
  }

  /** it should select optional objects */ {
    const maybeUser = form.select('maybeUser');

    type _t1 = Expect<
      Equal<typeof maybeUser.control, Control<{ name: string }>>
    >;

    maybeUser.register('name');
  }

  /** it should select arrays as leaves */ {
    const items = form.select('items');
    const first = items.select(0);
    const firstName = items.select('0.name');

    type _t1 = Expect<Equal<typeof items, LeafSelection<FormValues['items']>>>;
    type _t2 = Expect<
      Equal<typeof first, FormSelection<{ name: string; count: number }>>
    >;
    type _t3 = Expect<Equal<typeof firstName, LeafSelection<string>>>;

    first.register('count');

    // @ts-expect-error unknown item key
    items.select('0.unknown');
  }

  /** it should select union objects */ {
    const pet = form.select('pet');

    type _t1 = Expect<Equal<typeof pet.control, Control<FormValues['pet']>>>;

    pet.register('type');
  }

  /** it should reject unknown paths */ {
    // @ts-expect-error unknown path
    form.select('unknown');
  }

  /** it should type the leaf hooks */ {
    const title = form.select('title');
    const tags = form.select('tags');
    const items = form.select('items');

    const controller = useController({ control: title.control });

    type _t1 = Expect<Equal<typeof controller.field.value, string>>;
    type _t2 = Expect<Equal<typeof controller.field.name, string>>;

    const value = useWatch({ control: title.control });
    const length = useWatch({
      control: title.control,
      compute: (value) => value.length,
    });
    const formState = useFormState({ control: title.control });

    type _t3 = Expect<Equal<typeof value, string>>;
    type _t4 = Expect<Equal<typeof length, number>>;
    type _t5 = Expect<Equal<typeof formState.isDirty, boolean>>;

    const { fields, append } = useFieldArray({ control: items.control });

    type _t6 = Expect<
      Equal<
        (typeof fields)[number]['name'],
        FormValues['items'][number]['name']
      >
    >;

    append({ name: '', count: 0 });
    // @ts-expect-error wrong item
    append({ name: 1 });

    useWatch({ control: tags.control, defaultValue: ['a'] });

    Controller({
      control: title.control,
      render: ({ field }) => {
        type _t7 = Expect<Equal<typeof field.value, string>>;
        return null as unknown as React.ReactElement;
      },
    });

    // @ts-expect-error a leaf control has no relative names
    useController({ control: title.control, name: 'length' });
  }

  /** it should type the object hooks with relative names */ {
    const user = form.select('user');

    const { field } = useController({
      control: user.control,
      name: 'firstName',
    });
    const city = useWatch({ control: user.control, name: 'address.city' });
    const values = useWatch({ control: user.control });
    const { errors } = useFormState({ control: user.control });

    type _t1 = Expect<Equal<typeof field.value, string>>;
    type _t2 = Expect<Equal<typeof city, string>>;
    type _t3 = Expect<Equal<typeof values.firstName, string | undefined>>;
    type _t4 = Expect<Equal<typeof errors, FieldErrors<FormValues['user']>>>;

    // @ts-expect-error name is required for object controls
    useController({ control: user.control });
    // @ts-expect-error full name is not relative
    useController({ control: user.control, name: 'user.firstName' });
  }

  /** it should keep the existing hook signatures */ {
    const { field } = useController({ control: form.control, name: 'title' });
    const title = useWatch({ control: form.control, name: 'title' });
    const values = useWatch({ control: form.control });
    const formState = useFormState({ control: form.control });
    const { fields } = useFieldArray({ control: form.control, name: 'items' });

    type _t1 = Expect<Equal<typeof field.value, string>>;
    type _t2 = Expect<Equal<typeof title, string>>;
    type _t3 = Expect<Equal<typeof values.title, string | undefined>>;
    type _t4 = Expect<Equal<typeof formState.errors, FieldErrors<FormValues>>>;
    type _t5 = Expect<Equal<(typeof fields)[number]['count'], number>>;

    // @ts-expect-error name is still required
    useController({ control: form.control });
  }

  /** it should reshape a selection with a map of paths */ {
    const person = form.select('user').select({
      name: 'firstName',
      location: { town: 'address.city' },
    });

    type _t1 = Expect<
      Equal<
        typeof person,
        FormSelection<{ name: string; location: { town: string } }>
      >
    >;

    person.register('name');
    person.register('location.town');

    const { field } = useController({ control: person.control, name: 'name' });

    type _t2 = Expect<Equal<typeof field.value, string>>;

    // @ts-expect-error unknown path in the map
    form.select('user').select({ name: 'unknown' });
  }

  /** it should reshape the form with a map of paths */ {
    const reshaped = form.select({
      heading: 'title',
      city: 'user.address.city',
    });

    type _t1 = Expect<
      Equal<typeof reshaped, FormSelection<{ heading: string; city: string }>>
    >;
  }

  /** it should wrap a leaf with a map */ {
    const wrapped = form.select('title').select({ data: '' });

    type _t1 = Expect<Equal<typeof wrapped, FormSelection<{ data: string }>>>;
  }

  /** it should reshape array items */ {
    const items = form.select('items').select([{ label: 'name' }]);

    type _t1 = Expect<Equal<typeof items, FormSelection<{ label: string }[]>>>;

    const { fields, append } = useFieldArray({ control: items.control });

    type _t2 = Expect<Equal<(typeof fields)[number]['label'], string>>;

    append({ label: 'label' });

    // @ts-expect-error only arrays reshape items
    form.select('user').select([{ label: 'firstName' }]);
  }

  /** it should map field array fields to item selections */ {
    const items = form.select('items');
    const { fields } = useFieldArray({ control: items.control });

    const result = items.map(fields, (field, item, index, all, origin) => {
      type _t1 = Expect<Equal<typeof field, (typeof fields)[number]>>;
      type _t2 = Expect<
        Equal<typeof item, FormSelection<FormValues['items'][number]>>
      >;
      type _t3 = Expect<Equal<typeof index, number>>;
      type _t4 = Expect<
        Equal<typeof origin, FormSelection<FormValues['items']>>
      >;

      return all.length;
    });

    type _t5 = Expect<Equal<typeof result, number[]>>;

    // @ts-expect-error only arrays can be mapped
    form.select('user').map;
  }

  /** it should narrow, assert, define and cast selections */ {
    const pet = form.select('pet');
    const dog = pet.narrow('type', 'dog');
    const cat = pet.narrow<{ type: 'cat'; meow: boolean }>();
    const optional = form.select('optional').defined();
    const cast = form.select('title').cast<number>();

    type _t1 = Expect<
      Equal<typeof dog, FormSelection<{ type: 'dog'; bark: boolean }>>
    >;
    type _t2 = Expect<
      Equal<typeof cat, FormSelection<{ type: 'cat'; meow: boolean }>>
    >;
    type _t3 = Expect<Equal<typeof optional, FormSelection<string>>>;
    type _t4 = Expect<Equal<typeof cast, FormSelection<number>>>;

    dog.register('bark');

    const assertPet = (selection: FormSelection<FormValues['pet']>) => {
      selection.assert('type', 'cat');
      selection.register('meow');
    };

    assertPet(pet);

    // @ts-expect-error not a variant of the union
    pet.narrow('type', 'bird');
  }
}

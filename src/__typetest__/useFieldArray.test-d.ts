import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

// --- Native TypeScript type-test helpers ---------------------------------
// `Equal` does a strict, invariant equality check between two types.
// `Expect<T extends true>` forces `T` to be `true`, otherwise it errors at compile time.
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
// -------------------------------------------------------------------------

/** {@link useFieldArray} flat field array */ {
  /** it should work with multi-dimensional arrays */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      items: string[][][];
    };

    const { control } = useForm<FormValues>();

    const {
      fields: fields1,
      append: append1,
      prepend: prepend1,
      insert: insert1,
    } = useFieldArray({
      control,
      name: 'items',
    });

    type _fields1 = Expect<
      Equal<
        typeof fields1,
        (string[][] & { key: string } & { disabled?: boolean })[]
      >
    >;

    append1([['a', 'b'], ['c']]);
    append1([[['a', 'b'], ['c']]]);
    append1([['a', 'b'], ['c']], { shouldFocus: false });
    prepend1([['a', 'b'], ['c']]);
    insert1(0, [['a', 'b'], ['c']]);
    insert1(0, [['a', 'b'], ['c']], { shouldFocus: false });

    const {
      fields: fields2,
      append: append2,
      prepend: prepend2,
      insert: insert2,
    } = useFieldArray({
      control,
      name: 'items.0',
    });

    type _fields2 = Expect<
      Equal<
        typeof fields2,
        (string[] & { key: string } & { disabled?: boolean })[]
      >
    >;

    append2(['a', 'b']);
    append2([['a', 'b'], ['c']]);
    append2(['a', 'b'], { shouldFocus: false });
    prepend2(['a', 'b']);
    insert2(0, ['a', 'b']);

    const {
      fields: fields3,
      append: append3,
      prepend: prepend3,
      insert: insert3,
    } = useFieldArray({
      control,
      name: 'items.0.0',
    });

    type _fields3 = Expect<
      Equal<
        typeof fields3,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    append3('a');
    append3(['a', 'b']);
    append3('a', { shouldFocus: false });
    prepend3('a');
    insert3(0, 'a');
  }

  /** it should work with arrays of objects with array properties */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      items: {
        name: string;
        tags: string[];
        categories: number[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const {
      fields: itemFields,
      append: appendItem,
      update: updateItem,
    } = useFieldArray({
      control,
      name: 'items',
    });

    type _itemFields = Expect<
      Equal<
        typeof itemFields,
        ({ name: string; tags: string[]; categories: number[] } & {
          key: string;
        } & { disabled?: boolean })[]
      >
    >;

    appendItem({
      name: 'Item 1',
      tags: ['tag1', 'tag2'],
      categories: [1, 2],
    });
    appendItem([
      {
        name: 'Item 1',
        tags: ['tag1'],
        categories: [1],
      },
      {
        name: 'Item 2',
        tags: ['tag2'],
        categories: [2],
      },
    ]);
    updateItem(0, {
      name: 'Updated Item',
      tags: ['tag1'],
      categories: [1],
    });

    const {
      fields: tagFields,
      append: appendTag,
      update: updateTag,
      replace: replaceTags,
    } = useFieldArray({
      control,
      name: 'items.0.tags',
    });

    type _tagFields = Expect<
      Equal<
        typeof tagFields,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendTag('newTag');
    appendTag(['tag1', 'tag2']);
    updateTag(0, 'updatedTag');
    replaceTags('singleTag');
    replaceTags(['tag1', 'tag2']);

    const {
      fields: categoryFields,
      append: appendCategory,
      update: updateCategory,
      replace: replaceCategories,
    } = useFieldArray({
      control,
      name: 'items.0.categories',
    });

    type _categoryFields = Expect<
      Equal<
        typeof categoryFields,
        ({ value: number } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendCategory(5);
    appendCategory([5, 6]);
    updateCategory(0, 10);
    replaceCategories(100);
    replaceCategories([1, 2, 3]);
  }

  /** it should work with deeply nested array structures */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      groups: {
        name: string;
        users: {
          username: string;
          permissions: string[];
        }[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const { fields: groupFields, append: appendGroup } = useFieldArray({
      control,
      name: 'groups',
    });

    type _groupFields = Expect<
      Equal<
        typeof groupFields,
        ({
          name: string;
          users: { username: string; permissions: string[] }[];
        } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendGroup({
      name: 'Group 1',
      users: [{ username: 'user1', permissions: ['read'] }],
    });
    appendGroup([
      {
        name: 'Group 1',
        users: [{ username: 'user1', permissions: ['read'] }],
      },
    ]);

    const { fields: userFields, append: appendUser } = useFieldArray({
      control,
      name: 'groups.0.users',
    });

    type _userFields = Expect<
      Equal<
        typeof userFields,
        ({ username: string; permissions: string[] } & { key: string } & {
          disabled?: boolean;
        })[]
      >
    >;

    appendUser({
      username: 'newUser',
      permissions: ['read', 'write'],
    });
    appendUser([
      {
        username: 'user1',
        permissions: ['read'],
      },
      {
        username: 'user2',
        permissions: ['write'],
      },
    ]);

    const {
      fields: permissionFields,
      append: appendPermission,
      replace: replacePermissions,
    } = useFieldArray({
      control,
      name: 'groups.0.users.0.permissions',
    });

    type _permissionFields = Expect<
      Equal<
        typeof permissionFields,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendPermission('delete');
    appendPermission(['delete', 'admin']);
    replacePermissions('read');
    replacePermissions(['read', 'write', 'delete']);
  }

  /** it should work with all field array methods */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      items: {
        tags: string[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const { append, prepend, insert, update, replace, swap, move, remove } =
      useFieldArray({
        control,
        name: 'items.0.tags',
      });

    append('tag1');
    append(['tag1', 'tag2']);
    append('tag1', { shouldFocus: false });
    prepend('tag0');
    prepend(['tag0', 'tag-1']);

    insert(1, 'tag1.5');
    insert(1, ['tag1', 'tag2']);
    insert(1, 'tag1.5', { shouldFocus: false });

    update(0, 'updatedTag');

    replace('newTag');
    replace(['newTag1', 'newTag2']);

    swap(0, 1);
    move(0, 2);

    remove(0);
    remove([0, 1]);
    remove();
  }

  /** it should work with simple array of objects */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      items: {
        tags: string[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const { append, prepend, insert, update } = useFieldArray({
      control,
      name: 'items.0.tags',
    });

    append('tag');
    append(['tag1', 'tag2']);
    prepend('tag');
    insert(0, 'tag');
    insert(0, ['tag1', 'tag2']);
    update(0, 'tag');
  }
}

/** {@link useFieldArray} nested field array */ {
  /** it should work with nested field arrays using dynamic indices */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      items: {
        name: string;
        tags: string[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const { fields: items, append: appendItem } = useFieldArray({
      control,
      name: 'items',
    });

    type _items = Expect<
      Equal<
        typeof items,
        ({ name: string; tags: string[] } & { key: string } & {
          disabled?: boolean;
        })[]
      >
    >;

    appendItem({ name: 'Item', tags: ['tag1'] });

    const {
      fields: tagFields,
      append: appendTag,
      remove: removeTag,
    } = useFieldArray({
      control,
      name: `items.${0}.tags`,
    });

    type _tagFields = Expect<
      Equal<
        typeof tagFields,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendTag('newTag');
    appendTag(['tag1', 'tag2']);
    removeTag(0);
  }

  /** it should work with deeply nested field arrays */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      groups: {
        name: string;
        users: {
          username: string;
          roles: string[];
        }[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const { fields: groups, append: appendGroup } = useFieldArray({
      control,
      name: 'groups',
    });

    type _groups = Expect<
      Equal<
        typeof groups,
        ({
          name: string;
          users: { username: string; roles: string[] }[];
        } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendGroup({
      name: 'Group 1',
      users: [{ username: 'user1', roles: ['admin'] }],
    });

    const { fields: userFields, append: appendUser } = useFieldArray({
      control,
      name: `groups.${0}.users`,
    });

    type _userFields = Expect<
      Equal<
        typeof userFields,
        ({ username: string; roles: string[] } & { key: string } & {
          disabled?: boolean;
        })[]
      >
    >;

    appendUser({ username: 'newUser', roles: ['user'] });

    const { fields: roleFields, append: appendRole } = useFieldArray({
      control,
      name: `groups.${0}.users.${0}.roles`,
    });

    type _roleFields = Expect<
      Equal<
        typeof roleFields,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendRole('moderator');
    appendRole(['admin', 'moderator']);
  }

  /** it should work with mixed flat and nested config */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    type FormValues = {
      projects: {
        title: string;
        tasks: {
          description: string;
          tags: string[];
        }[];
      }[];
    };

    const { control } = useForm<FormValues>();

    const { fields: projects, append: appendProject } = useFieldArray({
      control,
      name: 'projects',
    });

    type _projects = Expect<
      Equal<
        typeof projects,
        ({
          title: string;
          tasks: { description: string; tags: string[] }[];
        } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendProject({
      title: 'Project 1',
      tasks: [{ description: 'Task 1', tags: ['urgent'] }],
    });

    const { fields: taskFields, append: appendTask } = useFieldArray({
      control,
      name: `projects.${0}.tasks`,
    });

    type _taskFields = Expect<
      Equal<
        typeof taskFields,
        ({ description: string; tags: string[] } & { key: string } & {
          disabled?: boolean;
        })[]
      >
    >;

    appendTask({ description: 'New Task', tags: ['normal'] });

    const { fields: tagFields1, append: appendTag1 } = useFieldArray({
      control,
      name: `projects.${0}.tasks.${0}.tags`,
    });

    type _tagFields1 = Expect<
      Equal<
        typeof tagFields1,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendTag1('tag1');

    const { fields: tagFields2, append: appendTag2 } = useFieldArray({
      control,
      name: 'projects.0.tasks.0.tags',
    });

    type _tagFields2 = Expect<
      Equal<
        typeof tagFields2,
        ({ value: string } & { key: string } & { disabled?: boolean })[]
      >
    >;

    appendTag2('tag2');
  }
}

/** {@link useFieldArray} primitive rows */ {
  /** it should wrap primitive rows in { value } */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    const { control } = useForm<{
      strings: string[];
      numbers: number[];
      booleans: boolean[];
      objects: { name: string }[];
      values: { value: number; name: string }[];
      mixed: (string | { name: string })[];
    }>();
    const { fields: strings } = useFieldArray({ control, name: 'strings' });
    const { fields: numbers } = useFieldArray({ control, name: 'numbers' });
    const { fields: booleans } = useFieldArray({ control, name: 'booleans' });
    const { fields: objects } = useFieldArray({ control, name: 'objects' });
    const { fields: values } = useFieldArray({ control, name: 'values' });
    const { fields: mixed } = useFieldArray({ control, name: 'mixed' });

    type _string = Expect<Equal<(typeof strings)[number]['value'], string>>;
    type _number = Expect<Equal<(typeof numbers)[number]['value'], number>>;
    type _boolean = Expect<Equal<(typeof booleans)[number]['value'], boolean>>;
    type _key = Expect<Equal<(typeof booleans)[number]['key'], string>>;
    type _disabled = Expect<
      Equal<(typeof strings)[number]['disabled'], boolean | undefined>
    >;
    type _object = Expect<Equal<(typeof objects)[number]['name'], string>>;
    type _value = Expect<Equal<(typeof values)[number]['value'], number>>;
    type _mixed = Expect<
      Equal<
        typeof mixed,
        (({ value: string } | { name: string }) & { key: string } & {
          disabled?: boolean;
        })[]
      >
    >;

    strings[0].value.toUpperCase();
    // @ts-expect-error Primitive rows are wrappers, not strings.
    strings[0].toUpperCase();
    // @ts-expect-error Primitive wrappers do not have string indices.
    type _index = (typeof strings)[number][0];
    // @ts-expect-error Object rows do not gain a value property.
    type _objectValue = (typeof objects)[number]['value'];
    // @ts-expect-error The wrapper value preserves the primitive type.
    numbers[0].value.toUpperCase();
    // @ts-expect-error Union rows must be narrowed before reading value.
    type _mixedValue = (typeof mixed)[number]['value'];

    const row = mixed[0];
    if ('value' in row) {
      row.value.toUpperCase();
    } else {
      row.name.toUpperCase();
    }
  }

  /** it should wrap null and undefined rows in { value } */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    const { control } = useForm<{
      items: ({ name: string } | null | undefined)[];
    }>();
    const { fields } = useFieldArray({ control, name: 'items' });

    type _fields = Expect<
      Equal<
        typeof fields,
        (({ name: string } | { value: null } | { value: undefined }) & {
          key: string;
        } & { disabled?: boolean })[]
      >
    >;

    const row = fields[0];
    if ('name' in row) {
      row.name.toUpperCase();
    }
  }

  /** it should spread structurally Blob-compatible object rows */ {
    /* eslint-disable react-hooks/rules-of-hooks */

    const blob = new Blob();
    const blobLike = {
      size: blob.size,
      type: blob.type,
      arrayBuffer: () => blob.arrayBuffer(),
      bytes: () => blob.bytes(),
      slice: () => blob.slice(),
      stream: () => blob.stream(),
      text: () => blob.text(),
    } satisfies Blob;
    const { control } = useForm({ defaultValues: { items: [blobLike] } });
    const { fields } = useFieldArray({ control, name: 'items' });

    type _type = Expect<Equal<(typeof fields)[number]['type'], string>>;
    fields[0].type.toUpperCase();
    fields[0].text().then((text) => text.toUpperCase());
    // @ts-expect-error Structurally Blob-compatible objects are spread rows.
    type _blobValue = (typeof fields)[number]['value'];
  }
}

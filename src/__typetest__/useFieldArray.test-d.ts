import { expectType } from 'tsd';

import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

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

    expectType<(string[][] & { key: string })[]>(fields1);

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

    expectType<(string[] & { key: string })[]>(fields2);

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

    expectType<(string & { key: string })[]>(fields3);

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

    expectType<
      ({ name: string; tags: string[]; categories: number[] } & {
        key: string;
      })[]
    >(itemFields);

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

    expectType<(string & { key: string })[]>(tagFields);

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

    expectType<(number & { key: string })[]>(categoryFields);

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

    expectType<
      ({
        name: string;
        users: { username: string; permissions: string[] }[];
      } & { key: string })[]
    >(groupFields);

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

    expectType<
      ({ username: string; permissions: string[] } & { key: string })[]
    >(userFields);

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

    expectType<(string & { key: string })[]>(permissionFields);

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

    expectType<({ name: string; tags: string[] } & { key: string })[]>(items);

    appendItem({ name: 'Item', tags: ['tag1'] });

    const {
      fields: tagFields,
      append: appendTag,
      remove: removeTag,
    } = useFieldArray({
      control,
      name: `items.${0}.tags`,
    });

    expectType<(string & { key: string })[]>(tagFields);

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

    expectType<
      ({
        name: string;
        users: { username: string; roles: string[] }[];
      } & { key: string })[]
    >(groups);

    appendGroup({
      name: 'Group 1',
      users: [{ username: 'user1', roles: ['admin'] }],
    });

    const { fields: userFields, append: appendUser } = useFieldArray({
      control,
      name: `groups.${0}.users`,
    });

    expectType<({ username: string; roles: string[] } & { key: string })[]>(
      userFields,
    );

    appendUser({ username: 'newUser', roles: ['user'] });

    const { fields: roleFields, append: appendRole } = useFieldArray({
      control,
      name: `groups.${0}.users.${0}.roles`,
    });

    expectType<(string & { key: string })[]>(roleFields);

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

    expectType<
      ({
        title: string;
        tasks: { description: string; tags: string[] }[];
      } & { key: string })[]
    >(projects);

    appendProject({
      title: 'Project 1',
      tasks: [{ description: 'Task 1', tags: ['urgent'] }],
    });

    const { fields: taskFields, append: appendTask } = useFieldArray({
      control,
      name: `projects.${0}.tasks`,
    });

    expectType<({ description: string; tags: string[] } & { key: string })[]>(
      taskFields,
    );

    appendTask({ description: 'New Task', tags: ['normal'] });

    const { fields: tagFields1, append: appendTag1 } = useFieldArray({
      control,
      name: `projects.${0}.tasks.${0}.tags`,
    });

    expectType<(string & { key: string })[]>(tagFields1);

    appendTag1('tag1');

    const { fields: tagFields2, append: appendTag2 } = useFieldArray({
      control,
      name: 'projects.0.tasks.0.tags',
    });

    expectType<(string & { key: string })[]>(tagFields2);

    appendTag2('tag2');
  }
}

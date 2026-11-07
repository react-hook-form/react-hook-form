import type { FieldRefs, InternalFieldName } from '../..';
import getResolverOptions from '../../logic/getResolverOptions';
import get from '../../utils/get';

describe('getFielfs', () => {
  it('does not overwrite parent registration metadata with child fields', () => {
    const parent = {
      ref: { name: 'requester' },
      name: 'requester',
      mount: true,
    };
    const child = {
      ref: { name: 'requester.name' },
      name: 'requester.name',
      mount: true,
    };
    const fieldsRef: FieldRefs = {
      requester: { _f: parent, name: { _f: child } },
    };

    const result = getResolverOptions(
      new Set(['requester', 'requester.name']),
      fieldsRef,
    );

    expect(result.fields.requester.name).toEqual(child);
    expect(parent).toEqual({
      ref: { name: 'requester' },
      name: 'requester',
      mount: true,
    });
  });

  it('does not mutate object values when a child path traverses parent metadata', () => {
    const value = { name: 'Saved name' };
    const parent = {
      ref: { name: 'requester' },
      name: 'requester',
      mount: true,
      value,
    };
    const child = {
      ref: { name: 'requester.value.name' },
      name: 'requester.value.name',
      mount: true,
    };
    const fieldsRef: FieldRefs = {
      requester: { _f: parent, value: { name: { _f: child } } },
    };

    getResolverOptions(
      new Set(['requester', 'requester.value.name']),
      fieldsRef,
    );

    expect(value).toEqual({ name: 'Saved name' });
  });

  it('preserves DOM refs for native validation and error focus', () => {
    const ref = document.createElement('input');
    ref.name = 'requester.name';
    const fieldsRef: FieldRefs = {
      requester: { name: { _f: { ref, name: ref.name, mount: true } } },
    };

    const result = getResolverOptions(new Set([ref.name]), fieldsRef);

    expect(get(result.fields, 'requester.name.ref')).toBe(ref);
  });

  it('return fields from `fieldsNames` and `fieldsRef`', () => {
    const fieldNames: Set<InternalFieldName> = new Set(['test.sub', 'test1']);
    const fieldsRef: any = {
      test: {
        sub: {
          _f: {
            ref: { name: 'test.sub', value: 'test' },
            name: 'test.sub',
            value: 'test',
          },
        },
      },
      test1: {
        _f: {
          ref: { name: 'test1', value: 'test1' },
          name: 'test1',
          value: 'test1',
        },
      },
    };

    expect(getResolverOptions(fieldNames, fieldsRef, undefined, true))
      .toMatchInlineSnapshot(`
      {
        "criteriaMode": undefined,
        "fields": {
          "test": {
            "sub": {
              "name": "test.sub",
              "ref": {
                "name": "test.sub",
                "value": "test",
              },
              "value": "test",
            },
          },
          "test1": {
            "name": "test1",
            "ref": {
              "name": "test1",
              "value": "test1",
            },
            "value": "test1",
          },
        },
        "names": [
          "test.sub",
          "test1",
        ],
        "shouldUseNativeValidation": true,
      }
    `);
  });
});

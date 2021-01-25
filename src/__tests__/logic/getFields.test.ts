import { InternalFieldName } from '../..';
import getFields from '../../logic/getFields';

describe('getFielfs', () => {
  it('should return fields from `fieldsNames` and `fieldsRef`', () => {
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

    expect(getFields(fieldNames, fieldsRef)).toMatchInlineSnapshot(`
      Object {
        "test": Object {
          "sub": Object {
            "name": "test.sub",
            "ref": Object {
              "name": "test.sub",
              "value": "test",
            },
            "value": "test",
          },
        },
        "test1": Object {
          "name": "test1",
          "ref": Object {
            "name": "test1",
            "value": "test1",
          },
          "value": "test1",
        },
      }
    `);
  });
});

import getFieldValueByName from './getFieldArrayValueByName';

const testFields = {
  'email[0]': {
    ref: { name: 'email[0]', value: 'email[0]' },
  },
  'email[1]': {
    ref: { name: 'email[1]', value: 'email[1]' },
  },
  'email[2]': {
    ref: { name: 'email[2]', value: 'email[2]' },
  },
  'firstName[1]': {
    ref: { name: 'firstName[1]', value: 'firstName[1]' },
  },
  'firstName[2]': {
    ref: { name: 'firstName[2]', value: 'firstName[2]' },
  },
  'lastName[2]': {
    ref: { name: 'lastName[2]', value: 'lastName[2]' },
  },
  test: {
    ref: { name: 'test', value: 'test' },
  },
  'nested.test[1].what': {
    ref: { name: 'nested.test[1].what', value: 'nested.test[1].what' },
  },
  'nested["test"][1].task': {
    ref: { name: 'nested["test"][1].task', value: 'nested["test"][1].task' },
  },
  'nested.test[2].what[1].test': {
    ref: {
      name: 'nested.test[2].what[1].test',
      value: 'nested.test[2].what[1].test',
    },
  },
};

describe('getFieldValueByName', () => {
  it('should get fields value by email from test fields', () => {
    expect(getFieldValueByName(testFields, 'email')).toEqual([
      'email[0]',
      'email[1]',
      'email[2]',
    ]);
  });

  it('should get fields value by firstName from test fields', () => {
    expect(getFieldValueByName(testFields, 'firstName')).toEqual([
      undefined,
      'firstName[1]',
      'firstName[2]',
    ]);
  });

  it('should get fields value by lastname from test fields', () => {
    expect(getFieldValueByName(testFields, 'lastName')).toEqual([
      undefined,
      undefined,
      'lastName[2]',
    ]);
  });

  it('should get fields value by test from test fields', () => {
    expect(getFieldValueByName(testFields, 'test')).toEqual('test');
  });

  it('should get fields value by nested.test from test fields', () => {
    expect(getFieldValueByName(testFields, 'nested.test')).toEqual([
      undefined,
      {
        what: 'nested.test[1].what',
        task: 'nested["test"][1].task',
      },
      {
        what: [
          undefined,
          {
            test: 'nested.test[2].what[1].test',
          },
        ],
      },
    ]);
  });

  it('should get fields value by nested.test[2] from test fields', () => {
    expect(getFieldValueByName(testFields, 'nested.test[2]')).toEqual({
      what: [undefined, { test: 'nested.test[2].what[1].test' }],
    });
  });
});

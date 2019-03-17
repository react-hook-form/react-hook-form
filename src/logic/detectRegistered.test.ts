import detectRegistered from './detectRegistered';

describe('detectRegistered', () => {
  const inputs = {
    test: {
      ref: {},
      type: 'input',
    },
    select: {
      ref: {},
      type: 'select',
    },
    radioBill: {
      ref: {
        name: 'radioBill'
      },
      type: 'radio',
      name: 'radioBill',
      options: [
        {
          ref: {
            value: 'bill',
          },
          name: 'radioBill',
        },
      ],
    },
  };

  it('should detect if elements which have already been registered', () => {
    expect(
      detectRegistered(inputs, {
        ref: {
          type: 'input',
          name: 'test',
        },
      }),
    ).toBeTruthy();
  });

  it('should detect if type is radio', () => {
    expect(
      detectRegistered(inputs, {
        ref: {
          type: 'radio',
          name: 'radioBill',
          value: 'bill',
        },
      }),
    ).toBeTruthy();
  });

  it('should return false for type is radio when not found', () => {
    expect(
      detectRegistered(inputs, {
        ref: {
          type: 'radio',
          name: 'radioBill1',
          value: 'bill',
        },
      }),
    ).toBeFalsy();
  });
});

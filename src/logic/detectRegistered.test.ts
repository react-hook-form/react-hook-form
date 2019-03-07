import detectRegistered from './detectRegistered';

describe('detectRegistered', () => {
  const inputs = {
    test: {
      type: 'input',
      ref: {},
    },
    select: {
      type: 'select',
      ref: {},
    },
    radioBill: {
      ref: {},
      type: 'radio',
      options: ['bill'],
    },
  };

  it('should ', () => {
    
  });

  // it('should detect if elements which have already been registered', () => {
  //   expect(
  //     detectRegistered(inputs, {
  //       ref: {
  //         type: 'input',
  //         name: 'test',
  //       },
  //     }),
  //   ).toBeTruthy();
  // });
  //
  // it('should detect if type is radio', () => {
  //   expect(
  //     detectRegistered(inputs, {
  //       ref: {
  //         type: 'radio',
  //         name: 'radioBill',
  //         value: 'bill',
  //       },
  //     }),
  //   ).toBeTruthy();
  // });
});

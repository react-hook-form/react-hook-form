import extractFormValues from '../../utils/extractFormValues';

describe('loopObject', () => {
  it('should return true when it is an undefined value', () => {
    const formData = {
      test: {
        test: 'test',
        test1: 'test1',
        test2: 'test2',
        test3: 'test3',
        test4: {
          test: 'test',
          test1: 'test1',
          test2: 'test2',
          test3: 'test3',
        },
      },
    };

    const touchedFields = {
      test: {
        test: true,
        test4: {
          test3: true,
        },
      },
    };

    expect(extractFormValues(touchedFields, formData)).toEqual({
      test: {
        test: 'test',
        test4: {
          test3: 'test3',
        },
      },
    });
  });
});

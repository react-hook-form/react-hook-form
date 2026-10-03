import extractFormValues from '../../utils/extractFormValues';

describe('extractFormValues', () => {
  it('should return extracted form values based on form state', () => {
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

  it('should only extract the marked entries of a field array', () => {
    const formData = {
      records: [
        { name: 'test', note: 'note' },
        { name: 'test1', note: 'note1' },
      ],
    };

    const dirtyFields = {
      records: [undefined, { name: true }],
    };

    expect(extractFormValues(dirtyFields, formData)).toEqual({
      records: [undefined, { name: 'test1' }],
    });
  });
});

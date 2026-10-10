import extractFormValues from '../../utils/extractFormValues';

describe('extractFormValues', () => {
  it('return extracted form values based on form state', () => {
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

  it('only extract the marked entries of a field array', () => {
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

describe('extractFormValues own-property safety', () => {
  it('extracts an own field that shadows hasOwnProperty', () => {
    expect(
      extractFormValues({ hasOwnProperty: true }, { hasOwnProperty: 'value' }),
    ).toEqual({ hasOwnProperty: 'value' });
  });

  it('extracts a nested field that shadows hasOwnProperty', () => {
    expect(
      extractFormValues(
        { nested: { hasOwnProperty: true } },
        { nested: { hasOwnProperty: 'value', untouched: 'keep out' } },
      ),
    ).toEqual({ nested: { hasOwnProperty: 'value' } });
  });

  it('extracts an array entry with a field that shadows hasOwnProperty', () => {
    expect(
      extractFormValues(
        { records: [{ hasOwnProperty: true }] },
        { records: [{ hasOwnProperty: 'value', untouched: 'keep out' }] },
      ),
    ).toEqual({ records: [{ hasOwnProperty: 'value' }] });
  });

  it('extracts fields from a null-prototype state object', () => {
    const fieldsState = Object.assign(Object.create(null), { name: true });
    expect(extractFormValues(fieldsState, { name: 'value' })).toEqual({
      name: 'value',
    });
  });

  it('does not extract inherited fields', () => {
    const fieldsState = Object.assign(Object.create({ inherited: true }), {
      name: true,
    });
    expect(
      extractFormValues(fieldsState, { name: 'value', inherited: 'keep out' }),
    ).toEqual({ name: 'value' });
  });
});

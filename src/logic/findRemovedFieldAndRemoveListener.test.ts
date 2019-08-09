import findRemovedFieldAndRemoveListener from './findRemovedFieldAndRemoveListener';

jest.mock('./removeAllEventListeners');

describe('findMissDomAndClean', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return default fields value if nothing matches', () => {
    document.body.contains = jest.fn(() => true);
    const fields = {
      test: 'test',
    };
    expect(
      findRemovedFieldAndRemoveListener(
        // @ts-ignore
        fields,
        new Set(),
        new Set(),
        () => {},
        {
          ref: { name: 'bill', type: 'radio' },
        },
      ),
    ).toEqual(undefined);
  });

  it('should remove touched Fields reference', () => {
    const touchedRefs = new Set(['test', 'test1', 'test3']);
    // @ts-ignore
    findRemovedFieldAndRemoveListener({}, touchedRefs, new Set(), () => {}, {
      ref: { name: 'test', type: 'radio' },
      options: [
        {
          mutationWatcher: {
            disconnect: () => {},
          },
          ref: {},
        },
      ],
    });
    expect(touchedRefs).toEqual(new Set(['test1', 'test3']));
  });

  it('should remove options completely if option found and no option left', () => {
    document.body.contains = jest.fn(() => false);

    const ref = document.createElement('input');
    ref.setAttribute('name', 'test');
    ref.setAttribute('type', 'radio');

    const disconnect = jest.fn();
    const fields = {
      test: {
        name: 'test',
        ref: {},
        options: [
          {
            ref: 'test',
            mutationWatcher: {
              disconnect,
            },
          },
        ],
      },
    };
    findRemovedFieldAndRemoveListener(fields, new Set(), new Set(), () => {}, {
      ref: { name: 'test', type: 'radio' },
      options: [
        {
          mutationWatcher: {
            disconnect,
          },
          ref,
        },
      ],
    });

    expect(fields).toEqual({});
  });

  it('should remove none radio field when found', () => {
    const ref = document.createElement('input');
    ref.setAttribute('name', 'test');
    ref.setAttribute('type', 'radio');
    document.body.contains = jest.fn(() => false);
    const disconnect = jest.fn();
    const fields = {
      test: {
        name: 'test',
        ref: {},
        mutationWatcher: {
          disconnect,
        },
      },
      test1: {
        name: 'test',
        ref: {},
      },
    };

    findRemovedFieldAndRemoveListener(fields, new Set(), new Set(), () => {}, {
      ref,
      mutationWatcher: {
        disconnect,
      },
    });

    expect(fields).toMatchSnapshot();
  });

  it('should return undefined when empty ref', () => {
    const fields = {
      test: 'test',
    };
    expect(
      findRemovedFieldAndRemoveListener(
        // @ts-ignore
        fields,
        { current: new Set() },
        { current: new Set() },
        () => {},
        {},
      ),
    ).toEqual(undefined);
  });

  it('should work for radio type input', () => {
    const ref = document.createElement('input');
    ref.setAttribute('name', 'test');
    ref.setAttribute('type', 'radio');
    document.body.contains = jest.fn(() => false);
    const disconnect = jest.fn();
    const fields = {
      test: {
        name: 'test',
        ref: {},
        mutationWatcher: {
          disconnect,
        },
      },
      test1: {
        name: 'test',
        ref: {
          type: 'radio',
        },
      },
    };

    expect(
      findRemovedFieldAndRemoveListener(
        fields,
        new Set(),
        new Set(),
        () => {},
        {
          ref: { name: 'test', type: 'radio' },
          options: [{ ref }],
          mutationWatcher: {
            disconnect,
          },
        },
      ),
    ).toMatchSnapshot();
  });

  it('should not remove event listener when type is not Element', () => {
    document.body.contains = jest.fn(() => false);

    const disconnect = jest.fn();
    const fields = {
      test: {
        name: 'test',
        ref: {},
        options: [
          {
            ref: 'test',
            mutationWatcher: {
              disconnect,
            },
          },
        ],
      },
    };

    findRemovedFieldAndRemoveListener(fields, new Set(), new Set(), () => {}, {
      ref: { name: 'test', type: 'text' },
      options: [
        {
          mutationWatcher: {
            disconnect,
          },
          ref: {},
        },
      ],
    });

    expect(fields).toMatchSnapshot();

    expect(
      // @ts-ignore
      findRemovedFieldAndRemoveListener(
        fields,
        new Set(),
        new Set(),
        () => {},
        {
          ref: { name: 'test', type: 'text' },
        },
      ),
    ).toMatchSnapshot();
  });
});

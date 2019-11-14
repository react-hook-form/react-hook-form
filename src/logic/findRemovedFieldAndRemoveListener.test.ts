import findRemovedFieldAndRemoveListener from './findRemovedFieldAndRemoveListener';
import isDetached from '../utils/isDetached';

jest.mock('./removeAllEventListeners');
jest.mock('../utils/isDetached');

describe('findMissDomAndClean', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (isDetached as any).mockImplementation(() => {
      return true;
    });
  });

  it('should return default fields value if nothing matches', () => {
    document.body.contains = jest.fn(() => true);
    const fields = {
      test: 'test',
    };
    expect(
      findRemovedFieldAndRemoveListener(fields as any, () => {}, {
        ref: { name: 'bill', type: 'radio' },
      }),
    ).toEqual(undefined);
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
    findRemovedFieldAndRemoveListener(fields, () => {}, {
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

    findRemovedFieldAndRemoveListener(fields, () => {}, {
      ref,
      mutationWatcher: {
        disconnect,
      },
    });

    expect(fields).toMatchSnapshot();
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
      findRemovedFieldAndRemoveListener(fields, () => {}, {
        ref: { name: 'test', type: 'radio' },
        options: [{ ref }],
        mutationWatcher: {
          disconnect,
        },
      }),
    ).toMatchSnapshot();
  });

  it('should work for checkbox type input', () => {
    const ref = document.createElement('input');
    ref.setAttribute('name', 'test');
    ref.setAttribute('type', 'checkbox');
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
          type: 'checkbox',
        },
      },
    };

    expect(
      findRemovedFieldAndRemoveListener(fields, () => {}, {
        ref: { name: 'test', type: 'checkbox' },
        options: [{ ref }],
        mutationWatcher: {
          disconnect,
        },
      }),
    ).toMatchSnapshot();
  });

  it('should not remove event listener when type is not Element', () => {
    (isDetached as any).mockImplementation(() => {
      return false;
    });
    document.body.contains = jest.fn(() => false);

    const disconnect = jest.fn();
    const fields = {
      test: {
        name: 'test',
        type: 'radio',
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

    findRemovedFieldAndRemoveListener(fields, () => {}, {
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
      findRemovedFieldAndRemoveListener(fields, () => {}, {
        ref: { name: 'test', type: 'text' },
      }),
    ).toMatchSnapshot();
  });

  it('should return undefined when field is not found', () => {
    expect(
      findRemovedFieldAndRemoveListener({}, undefined, undefined as any, false),
    ).toBeUndefined();
  });

  it('should remove options when force delete is set to true', () => {
    (isDetached as any).mockImplementation(() => {
      return false;
    });

    document.body.contains = jest.fn(() => false);

    const ref = document.createElement('input');
    ref.setAttribute('name', 'test');
    ref.setAttribute('type', 'radio');

    const disconnect = jest.fn();
    const fields = {
      test: {
        name: 'test',
        ref: {},
        options: [],
      },
    };
    findRemovedFieldAndRemoveListener(
      fields,
      () => {},
      {
        ref: { name: 'test', type: 'radio' },
        options: [
          {
            mutationWatcher: {
              disconnect,
            },
            ref,
          },
        ],
      },
      true,
    );

    expect(fields).toEqual({});
  });
});

import findRemovedFieldAndRemoveListener from './findRemovedFieldAndRemoveListener';
import removeAllEventListeners from './removeAllEventListeners';

jest.mock('./removeAllEventListeners');

describe('findMissDomAndClean', () => {
  it('should return default fields value if nothing matches', () => {
    document.body.contains = jest.fn(() => true);
    const fields = {
      test: 'test',
    };
    expect(
      // @ts-ignore
      findRemovedFieldAndRemoveListener(fields, () => {}, {
        ref: { name: 'bill', type: 'radio' },
      }),
    ).toEqual(fields);
  });

  it('should remove options completely if option found and no option left', () => {
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

    expect(
      // @ts-ignore
      findRemovedFieldAndRemoveListener(fields, () => {}, {
        ref: { name: 'test', type: 'radio' },
        options: [
          {
            mutationWatcher: {
              disconnect,
            },
            ref: {},
          },
        ],
      }),
    ).toMatchSnapshot();
  });

  it('should remove none radio field when found', () => {
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

    expect(removeAllEventListeners).toBeCalled();
    expect(
      findRemovedFieldAndRemoveListener(fields, () => {}, {
        ref: { name: 'test', type: 'text' },
        mutationWatcher: {
          disconnect,
        },
      }),
    ).toMatchSnapshot();
  });
});

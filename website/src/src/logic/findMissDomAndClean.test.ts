import findMissDomAndClean from './findMissDomAndClean';
import removeAllEventListeners from './removeAllEventListeners';

jest.mock('./removeAllEventListeners');

describe('findMissDomAndClean', () => {
  it('should return default fields value if nothing matches', () => {
    document.body.contains = jest.fn(() => true);
    const fields = {
      test: 'test',
    };

    const props = {
      target: {
        ref: { name: 'bill', type: 'radio' },
      },
      fields,
      validateWithStateUpdate: () => {},
    };
    expect(findMissDomAndClean(props)).toEqual(fields);
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

    const props = {
      target: {
        ref: { name: 'test', type: 'radio' },
        options: [
          {
            mutationWatcher: {
              disconnect,
            },
            ref: {},
          },
        ],
      },
      fields,
      validateWithStateUpdate: () => {},
    };
    expect(findMissDomAndClean(props)).toMatchSnapshot();
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

    const props = {
      target: {
        ref: { name: 'test', type: 'text' },
        mutationWatcher: {
          disconnect,
        },
      },
      fields,
      validateWithStateUpdate: () => {},
    };
    expect(removeAllEventListeners).toBeCalled();
    expect(findMissDomAndClean(props)).toMatchSnapshot();
  });
});

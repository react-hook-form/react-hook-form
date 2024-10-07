import { flatten } from '../../utils/flatten';

describe('flatten', () => {
  it('should flatten form values into flat form data', () => {
    expect(
      flatten({
        hey: 'test',
        array: [
          {
            test: '1',
            test2: '2',
          },
        ],
        test: {
          nested: {
            test: 'bill',
          },
        },
      }),
    ).toMatchSnapshot();
  });
});

import { registerFieldArray } from '../../logic/registerFieldArray';

describe('registerFieldArray', () => {
  it('should register the correct field array inputs', () => {
    const fields = { current: {} };
    registerFieldArray(
      fields,
      'test',
      [
        {
          test1: '1',
          nested: [
            {
              data1: 'test1',
              data2: 'test1',
            },
          ],
        },
      ],
      0,
    );

    expect(fields.current).toMatchSnapshot();

    registerFieldArray(
      fields,
      'test',
      [
        {
          test2: '2',
          nested: [
            {
              data2: 'test2',
              data3: 'test2',
            },
            {
              data4: 'test2',
              data5: 'test2',
            },
          ],
        },
      ],
      0,
    );

    expect(fields.current).toMatchSnapshot();

    registerFieldArray(
      fields,
      'test',
      [
        {
          test: '3',
          nested: [
            {
              data3: 'test3',
              data4: 'test3',
            },
            {
              data5: 'test3',
              data6: 'test3',
            },
          ],
        },
      ],
      1,
    );

    expect(fields.current).toMatchSnapshot();

    registerFieldArray(
      fields,
      'test',
      [
        {
          test: '4',
          nested: [
            {
              data8: 'test3',
              deeper: [
                {
                  deeper1: 'test3',
                  deeper2: 'test3',
                },
                {
                  deeper3: 'test3',
                  deeper4: 'test3',
                },
              ],
            },
            {
              data10: 'test3',
              data11: {
                extra: 'test',
              },
            },
          ],
        },
      ],
      4,
    );

    expect(fields.current).toMatchSnapshot();
  });
});

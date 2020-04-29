import get from './get';

describe('get', () => {
  it('should get the right data', () => {
    const test = {
      bill: [1, 2, 3],
      luo: [1, 3, { betty: 'test' }],
      betty: { test: { test1: [{ test2: 'bill' }] } },
    };
    expect(get(test, 'bill')).toEqual([1, 2, 3]);
    expect(get(test, 'bill[0]')).toEqual(1);
    expect(get(test, 'luo[2].betty')).toEqual('test');
    expect(get(test, 'betty.test.test1[0].test2')).toEqual('bill');
  });

  it('should get from the flat data', () => {
    const test = {
      bill: 'test',
    };
    expect(get(test, 'bill')).toEqual('test');
  });
});

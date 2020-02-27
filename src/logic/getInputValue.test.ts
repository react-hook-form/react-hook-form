import getInputValue from './getInputValue';

test('getInputValue should return correct value', () => {
  expect(
    getInputValue({ target: { checked: true, type: 'test' } }, false),
  ).toEqual(true);
  expect(getInputValue({ target: { checked: true } }, false)).toEqual({
    target: { checked: true },
  });
  expect(
    getInputValue({ target: { value: 'test', type: 'test' } }, false),
  ).toEqual('test');
  expect(getInputValue({ data: 'test' }, false)).toEqual({ data: 'test' });
  expect(getInputValue('test', false)).toEqual('test');
  expect(getInputValue(undefined, false)).toEqual(undefined);
  expect(getInputValue(null, false)).toEqual(null);
});

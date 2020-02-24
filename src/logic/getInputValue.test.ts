import getInputValue from './getInputValue';

test('getInputValue should return correct value', () => {
  expect(getInputValue({ target: { checked: true } })).toEqual(true);
  expect(getInputValue({ target: { value: 'test' } })).toEqual('test');
  expect(getInputValue({ data: 'test' })).toEqual({ data: 'test' });
  expect(getInputValue(undefined)).toEqual(undefined);
  expect(getInputValue(null)).toEqual(null);
});

import getInputValue from './getInputValue';

test('getInputValue should return correct value', () => {
  expect(getInputValue({ checked: true }, true)).toEqual(true);
  expect(getInputValue({ checked: true }, false)).toEqual({ checked: true });
  expect(getInputValue({ value: 'test' }, false)).toEqual('test');
  expect(getInputValue({ data: 'test' }, false)).toEqual({ data: 'test' });
  expect(getInputValue(undefined, false)).toEqual(undefined);
  expect(getInputValue(null, false)).toEqual(null);
});

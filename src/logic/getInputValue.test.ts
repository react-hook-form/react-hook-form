import getInputValue from './getInputValue';

test('getInputValue should return correct value', () => {
  expect(getInputValue({ target: { checked: true }, type: 'test' })).toEqual(
    true,
  );
  expect(getInputValue({ target: { checked: true } })).toEqual({
    target: { checked: true },
  });
  expect(getInputValue({ target: { value: 'test' }, type: 'test' })).toEqual(
    'test',
  );
  expect(getInputValue({ data: 'test' })).toEqual({ data: 'test' });
  expect(getInputValue('test')).toEqual('test');
  expect(getInputValue(undefined)).toEqual(undefined);
  expect(getInputValue(null)).toEqual(null);
});

import getControllerValue from './getControllerValue';

test('getControllerValue should return correct value', () => {
  expect(
    getControllerValue({ target: { checked: true }, type: 'test' }),
  ).toEqual(true);
  expect(getControllerValue({ target: { checked: true } })).toEqual({
    target: { checked: true },
  });
  expect(
    getControllerValue({ target: { value: 'test' }, type: 'test' }),
  ).toEqual('test');
  expect(getControllerValue({ data: 'test' })).toEqual({ data: 'test' });
  expect(getControllerValue('test')).toEqual('test');
  expect(getControllerValue(undefined)).toEqual(undefined);
  expect(getControllerValue(null)).toEqual(null);
});

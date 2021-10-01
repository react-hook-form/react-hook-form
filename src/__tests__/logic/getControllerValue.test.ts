import getControllerValue from '../../logic/getControllerValue';

test('getControllerValue should return correct value', () => {
  expect(
    getControllerValue({
      target: { checked: true, type: 'checkbox' },
    }),
  ).toEqual(true);
  expect(
    getControllerValue({
      target: { checked: true, type: 'checkbox', value: 'test' },
    }),
  ).toEqual(true);
  expect(
    getControllerValue({ target: { value: 'test' }, type: 'test' }),
  ).toEqual('test');
  expect(getControllerValue({ data: 'test' })).toEqual({ data: 'test' });
  expect(getControllerValue('test')).toEqual('test');
  expect(getControllerValue(undefined)).toEqual(undefined);
  expect(getControllerValue(null)).toEqual(null);
});

import getEventValue from '../../logic/getEventValue';

test('getEventValue should return correct value', () => {
  expect(
    getEventValue({
      target: { checked: true, type: 'checkbox' },
    }),
  ).toEqual(true);
  expect(
    getEventValue({
      target: { checked: true, type: 'checkbox', value: 'test' },
    }),
  ).toEqual(true);
  expect(getEventValue({ data: 'test' })).toEqual({ data: 'test' });
  expect(getEventValue('test')).toEqual('test');
  expect(getEventValue(undefined)).toEqual(undefined);
  expect(getEventValue(null)).toEqual(null);
});

test('getEventValue should return correct value if CustomEvent is received', () => {
  const customEvent = new CustomEvent('event', { detail: { value: 'test' } });

  expect(getEventValue(customEvent)).toEqual('test');
});

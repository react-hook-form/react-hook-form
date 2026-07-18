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
  expect(getEventValue({ target: { value: 'test' }, type: 'test' })).toEqual(
    'test',
  );
  expect(getEventValue({ data: 'test' })).toEqual({ data: 'test' });
  expect(getEventValue('test')).toEqual('test');
  expect(getEventValue(undefined)).toEqual(undefined);
  expect(getEventValue(null)).toEqual(null);
});

test('getEventValue should return files for a file input target', () => {
  const files = [new File(['hello'], 'hello.png', { type: 'image/png' })];

  expect(
    getEventValue({
      target: { type: 'file', files, value: 'C:\\fakepath\\hello.png' },
    }),
  ).toEqual(files);

  expect(getEventValue({ target: { type: 'file', files: [] } })).toEqual([]);
});

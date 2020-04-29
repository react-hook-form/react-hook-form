import generateId from './generateId';

test('should generate a unique id', () => {
  expect(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/i.test(generateId())).toBeTruthy();
});

import combineFieldValues from './combineFieldValues';

describe('combineFieldValues', () => {
  it('should combine all the array fields', () => {
    expect(
      combineFieldValues({
        'email[1]': 'asdasd@dsad.com',
        'email[2]': 'asdasd@.com',
        'firstName[1]': 'asdasd',
        'firstName[2]': 'asdasd',
        'lastName[1]': 'asdasd',
        'lastName[2]': 'asd',
        test: 'test',
      }),
    ).toMatchSnapshot();
  });

  it('should combine array object correctly', () => {
    expect(
      combineFieldValues({
        'name[0].firstName': 'testFirst',
        'name[0].lastName': 'testLast',
        'test[1].what': 'testLast',
        'test[1].task': 'testLast',
        'test[2].what': 'testLast',
        'test[2].what[1].test': 'testLast',
      }),
    ).toMatchSnapshot();
  });

  it('should combine object correctly', () => {
    expect(
      combineFieldValues({
        'name.firstName': 'testFirst',
        'name.lastName': 'testLast',
        'name.lastName.bill.luo': 'testLast',
      }),
    ).toMatchSnapshot();
  });

  it('should return default name value', () => {
    expect(
      combineFieldValues({
        'name': 'testFirst',
      }),
    ).toMatchSnapshot();
  });
});

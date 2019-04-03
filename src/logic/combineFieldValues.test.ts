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
});

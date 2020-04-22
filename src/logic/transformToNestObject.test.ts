import { transformToNestObject } from './transformToNestObject';

describe('transformToNestObject', () => {
  it('should combine all the array fields', () => {
    expect(
      transformToNestObject({
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
      transformToNestObject({
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
      transformToNestObject({
        'name.firstName': 'testFirst',
        'name.lastName': 'testLast',
        'name.lastName.bill.luo': 'testLast',
      }),
    ).toMatchSnapshot();
  });

  it('should return default name value', () => {
    expect(
      transformToNestObject({
        name: 'testFirst',
      }),
    ).toMatchSnapshot();
  });

  it('should handle quoted values', () => {
    expect(
      transformToNestObject({
        'name["foobar"]': 'testFirst',
      }),
    ).toMatchSnapshot();

    expect(
      transformToNestObject({
        'name["b2ill"]': 'testFirst',
      }),
    ).toMatchSnapshot();
  });

  it('should combine with results', () => {
    expect(
      transformToNestObject({
        name: 'testFirst',
        name1: 'testFirst',
        name2: 'testFirst',
      }),
    ).toMatchSnapshot();
  });
});

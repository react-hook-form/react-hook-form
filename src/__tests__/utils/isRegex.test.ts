import isRegex from '../../utils/isRegex';

describe('isRegex', () => {
  it('return true when it is a regex', () => {
    expect(isRegex(new RegExp('[a-z]'))).toBeTruthy();
  });
});

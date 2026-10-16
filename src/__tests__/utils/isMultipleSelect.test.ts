import isMultipleSelect from '../../utils/isMultipleSelect';

describe('isMultipleSelect', () => {
  it('return true when type is select-multiple', () => {
    expect(
      isMultipleSelect({ name: 'test', type: 'select-multiple' }),
    ).toBeTruthy();
  });
});

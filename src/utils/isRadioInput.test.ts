import isRadioInput from './isRadioInput';

describe('isRadioInput', () => {
  it('should return true when type is radio', () => {
    expect(isRadioInput({ name: 'test', type: 'radio' })).toBeTruthy();
  });
});

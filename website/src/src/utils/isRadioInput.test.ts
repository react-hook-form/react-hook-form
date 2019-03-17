import isRadioInput from './isRadioInput';

describe('isRadioInput', () => {
  it('should return true when type is radio', () => {
    expect(isRadioInput('radio')).toBeTruthy();
  });
});

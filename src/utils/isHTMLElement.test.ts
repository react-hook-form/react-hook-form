import isHTMLElement from './isHTMLElement';

describe('isHTMLElement', () => {
  it('should return true when value is HTMLElement', () => {
    expect(isHTMLElement(document.createElement('input'))).toBeTruthy();
  });
});

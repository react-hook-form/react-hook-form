import React from 'react';
import isMessage from './isMessage';

describe('isBoolean', () => {
  it('should return true when value is a Message', () => {
    expect(isMessage('test')).toBeTruthy();
    expect(isMessage(React.createElement('p'))).toBeTruthy();
  });

  it('should return false when value is not a Message', () => {
    expect(isMessage(null)).toBeFalsy();
    expect(isMessage(undefined)).toBeFalsy();
    expect(isMessage(-1)).toBeFalsy();
    expect(isMessage(0)).toBeFalsy();
    expect(isMessage(1)).toBeFalsy();
    expect(isMessage({})).toBeFalsy();
    expect(isMessage([])).toBeFalsy();
    expect(isMessage(() => null)).toBeFalsy();
  });
});

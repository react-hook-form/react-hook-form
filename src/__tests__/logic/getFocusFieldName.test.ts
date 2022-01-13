import getFocusFieldName from '../../logic/getFocusFieldName';

describe('getFocusFieldName', () => {
  it('should return expected focus name', () => {
    expect(getFocusFieldName('test', 0, { focus: false })).toEqual('');
    expect(
      getFocusFieldName('test', 0, { focus: true, focusName: 'test' }),
    ).toEqual('test');
    expect(
      getFocusFieldName('test', 0, { focus: true, focusIndex: 1 }),
    ).toEqual('test.1.');
    expect(getFocusFieldName('test', 0)).toEqual('test.0.');
  });
});

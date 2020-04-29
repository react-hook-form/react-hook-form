import attachNativeValidation from './attachNativeValidation';

describe('attachNativeRule', () => {
  it('should attach native validation rule accordingly', () => {
    const ref = {};
    attachNativeValidation(
      ref,
      {
        required: true,
      },
    );

    // @ts-ignore
    expect(ref.required).toBeTruthy();

    attachNativeValidation(
      ref,
      {
        pattern: /d+/,
      },
    );
    // @ts-ignore
    expect(ref.pattern).toEqual('d+');

    attachNativeValidation(
      ref,
      {
        min: 2,
      },
    );
    // @ts-ignore
    expect(ref.min).toEqual(2);
  });
});

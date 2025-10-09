import skipValidation from '../../logic/skipValidation';

describe('should skip validation', () => {
  it('when is onChange mode and blur event', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: true,
          isOnBlur: true,
          isOnTouch: false,
        },
      ),
    ).toBeTruthy();
  });

  it('when is onSubmit mode and re-validate on Submit', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: false,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
      ),
    ).toBeTruthy();
  });

  it('when is onSubmit mode and not submitted yet', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
      ),
    ).toBeTruthy();
  });

  it('when on blur mode, not blur event and error gets clear', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: true,
          isOnTouch: false,
        },
      ),
    ).toBeTruthy();
  });

  it('when re-validate mode is blur, not blur event and has error ', () => {
    expect(
      skipValidation(
        false,
        false,
        true,
        {
          isOnChange: true,
          isOnBlur: true,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
      ),
    ).toBeTruthy();
  });

  it('when is re-validate mode on submit and have error', () => {
    expect(
      skipValidation(
        false,
        false,
        true,
        {
          isOnChange: false,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
      ),
    ).toBeTruthy();
  });

  it('when focus event occurs, always skip validation', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: true,
          isOnBlur: false,
          isOnTouch: false,
          isOnAll: true,
        },
        true, // isFocusEvent
      ),
    ).toBeTruthy();
  });

  it('when focus event occurs in onAll mode, still skip validation', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
          isOnAll: true,
        },
        true, // isFocusEvent
      ),
    ).toBeTruthy();
  });
});

describe('should validate the input', () => {
  it('when form is submitted and there is error', () => {
    expect(
      skipValidation(
        false,
        false,
        true,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
      ),
    ).toBeFalsy();
  });

  it('when mode is under all', () => {
    expect(
      skipValidation(
        false,
        false,
        false,
        {
          isOnChange: false,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: false,
          isOnAll: true,
        },
      ),
    ).toBeFalsy();
  });

  it('when user blur input and there is no more error', () => {
    expect(
      skipValidation(
        true,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: true,
          isOnTouch: false,
        },
      ),
    ).toBeFalsy();
  });

  it('when user blur and there is an error', () => {
    expect(
      skipValidation(
        true,
        false,
        false,
        {
          isOnChange: true,
          isOnBlur: false,
        },
        {
          isOnChange: false,
          isOnBlur: true,
          isOnTouch: false,
        },
      ),
    ).toBeFalsy();
  });
});

describe('field-level mode overrides', () => {
  it('should use field-level mode instead of form-level mode when provided', () => {
    // Form mode is onSubmit, but field mode is onChange
    expect(
      skipValidation(
        false, // not blur event
        false, // not touched
        false, // not submitted
        {
          // form reValidateMode
          isOnChange: false,
          isOnBlur: false,
        },
        {
          // form mode (onSubmit)
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
        false, // not focus event
        {
          // field mode (onChange)
          isOnChange: true,
          isOnBlur: false,
          isOnTouch: false,
        },
      ),
    ).toBeFalsy(); // should NOT skip validation because field mode is onChange
  });

  it('should use field-level reValidateMode after submission', () => {
    // Form reValidateMode is onSubmit, but field reValidateMode is onChange
    expect(
      skipValidation(
        false, // not blur event
        false, // not touched
        true, // IS submitted
        {
          // form reValidateMode (onSubmit)
          isOnChange: false,
          isOnBlur: false,
        },
        {
          // form mode
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
        false, // not focus event
        undefined, // no field mode override
        {
          // field reValidateMode (onChange)
          isOnChange: true,
          isOnBlur: false,
        },
      ),
    ).toBeFalsy(); // should NOT skip validation because field reValidateMode is onChange
  });

  it('should fallback to form-level mode when no field-level mode is provided', () => {
    // No field mode, should use form mode (onSubmit)
    expect(
      skipValidation(
        false, // not blur event
        false, // not touched
        false, // not submitted
        {
          // form reValidateMode
          isOnChange: false,
          isOnBlur: false,
        },
        {
          // form mode (onSubmit)
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
        false, // not focus event
        undefined, // no field mode override
        undefined, // no field reValidateMode override
      ),
    ).toBeTruthy(); // should skip validation because form mode is onSubmit and not submitted yet
  });

  it('should respect field-level onBlur mode', () => {
    // Form mode is onChange, field mode is onBlur
    expect(
      skipValidation(
        true, // IS blur event
        false, // not touched
        false, // not submitted
        {
          // form reValidateMode
          isOnChange: true,
          isOnBlur: false,
        },
        {
          // form mode (onChange)
          isOnChange: true,
          isOnBlur: false,
          isOnTouch: false,
        },
        false, // not focus event
        {
          // field mode (onBlur)
          isOnChange: false,
          isOnBlur: true,
          isOnTouch: false,
        },
      ),
    ).toBeFalsy(); // should NOT skip validation because field mode is onBlur and it's a blur event
  });

  it('should respect field-level onAll mode', () => {
    // Form mode is onSubmit, field mode is onAll
    expect(
      skipValidation(
        false, // not blur event
        false, // not touched
        false, // not submitted
        {
          // form reValidateMode
          isOnChange: false,
          isOnBlur: false,
        },
        {
          // form mode (onSubmit)
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
        false, // not focus event
        {
          // field mode (onAll)
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
          isOnAll: true,
        },
      ),
    ).toBeFalsy(); // should NOT skip validation because field mode is onAll
  });

  it('should respect field-level reValidateMode onBlur after submission', () => {
    // Form reValidateMode is onChange, field reValidateMode is onBlur
    expect(
      skipValidation(
        true, // IS blur event
        false, // not touched
        true, // IS submitted
        {
          // form reValidateMode (onChange)
          isOnChange: true,
          isOnBlur: false,
        },
        {
          // form mode
          isOnChange: false,
          isOnBlur: false,
          isOnTouch: false,
        },
        false, // not focus event
        undefined, // no field mode override
        {
          // field reValidateMode (onBlur)
          isOnChange: false,
          isOnBlur: true,
        },
      ),
    ).toBeFalsy(); // should NOT skip validation because field reValidateMode is onBlur and it's a blur event
  });
});

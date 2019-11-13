import attachEventListeners from './attachEventListeners';

describe('attachEventListeners', () => {
  it('should attach change event for radio and return undefined', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          addEventListener,
        },
        eventAttached: [],
        name: 'test',
      },
    };

    expect(
      attachEventListeners({
        isRadioOrCheckbox: true,
        field: fields.test,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach on change event on radio type input when it is watched', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          addEventListener,
        },
        eventAttached: [],
        watch: true,
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: true,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach blur event when it is under blur mode', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          addEventListener,
        },
        eventAttached: [],
        watch: true,
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: true,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('blur', validateAndStateUpdate);
  });

  it('should attach blur event when re validate mode is under blur', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          addEventListener,
        },
        eventAttached: [],
        watch: true,
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: true,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('blur', validateAndStateUpdate);
  });

  it('should attach input event on none radio type input', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          addEventListener,
          name: 'test',
        },
        eventAttached: [],
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: false,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input when it is watched', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          name: 'test',
          addEventListener,
        },
        eventAttached: [],
        watch: true,
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: false,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach on blur event on radio type input', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          addEventListener,
        },
        eventAttached: [],
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: true,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          name: 'test',
          addEventListener,
        },
        eventAttached: [],
      },
    };

    expect(
      attachEventListeners({
        field: fields.test,
        isRadioOrCheckbox: false,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should return undefined when addEventListener is not found', () => {
    expect(
      attachEventListeners({
        field: { ref: {} },
        isRadioOrCheckbox: false,
        validateAndStateUpdate: () => {},
      }),
    ).toBeUndefined();
  });
});

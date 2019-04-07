import attachEventListeners from './attachEventListeners';

describe('attachEventListeners', () => {
  it('should return undefined when filed not found', () => {
    expect(
      attachEventListeners({
        mode: 'onchange',
        radioOptionIndex: 0,
        ref: {},
        // @ts-ignore
        field: {},
        isRadio: true,
        watchFields: {},
        validateAndStateUpdate: () => {},
      }),
    ).toBeUndefined();
  });

  it('should attach change event for radio and return undefined', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {},
        options: [
          {
            ref: {
              addEventListener,
            },
            eventAttached: [],
          },
        ],
      },
    };

    expect(
      attachEventListeners({
        watchFields: {},
        isRadio: true,
        mode: 'onChange',
        // @ts-ignore
        field: fields.test,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
        },
        type: 'radio',
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateAndStateUpdate);
    expect(fields.test.options[0].eventAttached).toBeTruthy();
  });

  it('should attach on change event on radio type input when it is watched', () => {
    const validateAndStateUpdate = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {},
        watch: true,
        options: [
          {
            ref: {
              addEventListener,
            },
            eventAttached: [],
          },
        ],
      },
    };

    expect(
      attachEventListeners({
        watchFields: {
          test: true,
        },
        mode: 'onSubmit',
        // @ts-ignore
        field: fields.test,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
        },
        isRadio: true,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateAndStateUpdate);
    expect(fields.test.options[0].eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input', () => {
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
        watchFields: {},
        mode: 'onChange',
        // @ts-ignore
        field: fields.test,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
          addEventListener,
        },
        isRadio: false,
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
          addEventListener,
        },
        eventAttached: [],
        watch: true,
      },
    };

    expect(
      attachEventListeners({
        watchFields: {
          test: true,
        },
        mode: 'onSubmit',
        // @ts-ignore
        field: fields.test,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
          addEventListener,
        },
        isRadio: false,
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
        ref: {},
        options: [
          {
            ref: {
              addEventListener,
            },
            eventAttached: [],
          },
        ],
      },
    };

    expect(
      attachEventListeners({
        watchFields: { test: true },
        mode: 'onBlur',
        // @ts-ignore
        field: fields.test,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
        },
        type: 'radio',
        isRadio: true,
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateAndStateUpdate);
    expect(fields.test.options[0].eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input', () => {
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
        watchFields: {
          test: true,
        },
        mode: 'onBlur',
        // @ts-ignore
        field: fields.test,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
          addEventListener,
        },
        isRadio: false,
        // @ts-ignore
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });
});

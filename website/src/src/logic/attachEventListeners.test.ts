import attachEventListeners from './attachEventListeners';

describe('attachEventListeners', () => {
  it('should return undefined when filed not found', () => {
    expect(
      attachEventListeners({
        mode: 'onchange',
        radioOptionIndex: 0,
        // @ts-ignore
        field: {
          ref: {
            name: 'test',
          },
        },
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
        name: 'test',
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
        ref: {
          name: 'test',
        },
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
          name: 'test',
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
          name: 'test',
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
        ref: {
          name: 'test',},
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
          name: 'test',
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
        isRadio: false,
        // @ts-ignore
        validateAndStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateAndStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });
});

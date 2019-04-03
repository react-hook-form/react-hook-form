import attachEventListeners from './attachEventListeners';

describe('attachEventListeners', () => {
  it('should return undefined when filed not found', () => {
    expect(
      attachEventListeners({
        mode: 'onchange',
        fields: {},
        radioOptionIndex: 0,
        ref: {},
        type: 'radio',
        name: 'test',
        watchFields: {},
        validateWithStateUpdate: () => {},
      }),
    ).toBeUndefined();
  });

  it('should return undefined', () => {
    const validateWithStateUpdate = jest.fn();
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
        mode: 'onChange',
        fields,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
        },
        type: 'radio',
        name: 'test',
        validateWithStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateWithStateUpdate);
    expect(fields.test.options[0].eventAttached).toBeTruthy();
  });

  it('should attach on change event on radio type input when it is watched', () => {
    const validateWithStateUpdate = jest.fn();
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
        fields,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
        },
        type: 'radio',
        name: 'test',
        validateWithStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateWithStateUpdate);
    expect(fields.test.options[0].eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input', () => {
    const validateWithStateUpdate = jest.fn();
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
        fields,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
          addEventListener,
        },
        type: 'text',
        name: 'test',
        validateWithStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateWithStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input when it is watched', () => {
    const validateWithStateUpdate = jest.fn();
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
        fields,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
          addEventListener,
        },
        type: 'text',
        name: 'test',
        validateWithStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateWithStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach on blur event on radio type input', () => {
    const validateWithStateUpdate = jest.fn();
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
        fields,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
        },
        type: 'radio',
        name: 'test',
        validateWithStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', validateWithStateUpdate);
    expect(fields.test.options[0].eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input', () => {
    const validateWithStateUpdate = jest.fn();
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
        fields,
        radioOptionIndex: 0,
        ref: {
          name: 'test',
          addEventListener,
        },
        type: 'text',
        name: 'test',
        validateWithStateUpdate,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', validateWithStateUpdate);
    expect(fields.test.eventAttached).toBeTruthy();
  });
});

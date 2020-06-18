import attachEventListeners from './attachEventListeners';

jest.mock('../utils/isHTMLElement', () => ({
  default: () => true,
}));

describe('attachEventListeners', () => {
  it('should attach change event for radio and return undefined', () => {
    const handleChange = jest.fn();
    const addEventListener = jest.fn();
    const fields = {
      test: {
        ref: {
          name: 'test',
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
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', handleChange);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach on change event on radio type input when it is watched', () => {
    const handleChange = jest.fn();
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
        isRadioOrCheckbox: true,
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', handleChange);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach blur event when it is under blur mode', () => {
    const handleChange = jest.fn();
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
        isRadioOrCheckbox: true,
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('blur', handleChange);
  });

  it('should attach blur event when re validate mode is under blur', () => {
    const handleChange = jest.fn();
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
        isRadioOrCheckbox: true,
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('blur', handleChange);
  });

  it('should attach input event on none radio type input', () => {
    const handleChange = jest.fn();
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
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', handleChange);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input when it is watched', () => {
    const handleChange = jest.fn();
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
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', handleChange);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach on blur event on radio type input', () => {
    const handleChange = jest.fn();
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
        isRadioOrCheckbox: true,
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('change', handleChange);
    expect(fields.test.eventAttached).toBeTruthy();
  });

  it('should attach input event on none radio type input', () => {
    const handleChange = jest.fn();
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
        handleChange,
      }),
    ).toBeUndefined();

    expect(addEventListener).toBeCalledWith('input', handleChange);
    expect(fields.test.eventAttached).toBeTruthy();
  });
});

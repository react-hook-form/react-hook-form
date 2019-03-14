import getOptionNonEventAttached from './getOptionNonEventAttached';

describe('getOptionNonEventAttached', () => {
  it('should get the option index', () => {
    expect(getOptionNonEventAttached({
      options: [
        {
          ref: {
            value: 'value',
          },
          eventAttached: false
        }
      ]
    }, 'radio', 'value')).toBe(0);
  });

  it('should return -1 when type not radio', () => {
    expect(getOptionNonEventAttached({
      options: [
        {
          ref: {
            value: 'value',
          },
          eventAttached: false
        }
      ]
    }, 'text', 'value')).toBe(-1);
  });

  it('should return -1 when option not found', () => {
    expect(getOptionNonEventAttached({
      options: [
        {
          ref: {
            value: 'value',
          },
          eventAttached: true
        }
      ]
    }, 'text', 'value')).toBe(-1);
  });
});

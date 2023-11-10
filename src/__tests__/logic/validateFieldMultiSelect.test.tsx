import validateField from '../../logic/validateField';
import * as isHTMLElement from '../../utils/isHTMLElement';

jest.mock('../../utils/isHTMLElement', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('validateField', () => {
  /**
   * In a custom built multislect, the value is an array of objects. But the referenced element does not necessarily have a value attribute.
   */
  it('should not detect isEmpty when handling a custom built multi select', async () => {
    jest.spyOn(isHTMLElement, 'default').mockImplementation(() => {
      return true;
    });

    expect(
      await validateField(
        {
          _f: {
            mount: true,
            name: 'test',
            ref: { value: '', name: 'test' },
            required: true,
          },
        },
        {
          test: [
            { label: 'Blackberry', value: 'blackberry' },
            { label: 'Banana', value: 'banana' },
          ],
        },
        false,
      ),
    ).toEqual({});
  });
});

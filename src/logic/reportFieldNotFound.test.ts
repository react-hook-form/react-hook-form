import reportFieldNotFound from './reportFieldNotFound';

jest.mock('../constants', () => ({
  IS_DEV_ENV: true,
}));

describe('reportFieldNotFound', () => {
  const original = console.error;
  const errorLog = jest.fn();

  beforeEach(() => {
    console.error = errorLog;
  });

  afterEach(() => {
    console.error = original;
  });

  it('should report when field is not found', () => {
    reportFieldNotFound('test');
    expect(errorLog).toBeCalledWith('test field not found.');
  });

  it('should ', () => {
    reportFieldNotFound('test', { last: 'test' });
    expect(errorLog).toBeCalledWith('test field not found.');
  });
});

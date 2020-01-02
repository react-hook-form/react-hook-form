import reportFieldNotFound from './reportFieldNotFound';

jest.mock('../constants', () => ({
  IS_DEV_ENV: true,
}));

describe('reportFieldNotFound', () => {
  const env = process.env.NODE_ENV;
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = env;
  });

  it('should report when field is not found', () => {
    expect(() => reportFieldNotFound('test')).toThrowError(
      'test field not found.',
    );
  });

  it('should ', () => {
    expect(() => reportFieldNotFound('test', { last: 'test' })).toThrowError(
      'test field not found.',
    );
  });
});

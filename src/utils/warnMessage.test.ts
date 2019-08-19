import warnMessage from './warnMessage';

describe('warnMessage', () => {
  const ENV = process.env;
  const consoleWarnMock = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    console['warn'] = consoleWarnMock;
  });
  afterEach(() => {
    process.env = ENV;
  });

  it('should log on non-production environments', () => {
    const testMsg = 'WARNING';
    process.env = { ...ENV, NODE_ENV: 'development' };
    warnMessage(testMsg);
    expect(consoleWarnMock).toHaveBeenCalledWith(testMsg);
    expect(consoleWarnMock).toHaveBeenCalledTimes(1);
  });
  it('should not log on production environments', () => {
    const testMsg = 'WARNING';
    process.env = { ...ENV, NODE_ENV: 'production' };
    warnMessage(testMsg);
    expect(consoleWarnMock).not.toHaveBeenCalled();
  });
});

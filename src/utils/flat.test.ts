import flat from './flat';

describe('flat', () => {
  it('should flat object and array', () => {
    expect(
      flat({
        test: ['test', { data: 'test' }],
      }),
    ).toEqual({ 'test[0]': 'test', 'test[1].data': 'test' });
  });
});

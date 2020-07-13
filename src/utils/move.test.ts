import moveArrayAt from './move';

describe('move', () => {
  it('should be able to move element of array', () => {
    const data = [
      {
        firstName: '1',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '2',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '3',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
    ];
    moveArrayAt(data, 0, 2);
    expect(data).toEqual([
      {
        firstName: '2',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '3',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
      {
        firstName: '1',
        lastName: 'Luo',
        id: '75309979-e340-49eb-8016-5f67bfb56c1c',
      },
    ]);
  });

  it('should return emtpy array when data passed was not an array', () => {
    expect(moveArrayAt({} as any, 0, 3)).toEqual([]);
  });
});

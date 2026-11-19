import filterTouchedErrors from '../../logic/filterTouchedErrors';

const required = { type: 'required', message: 'required' };
const custom = { type: 'custom', message: 'end must be after start' };

describe('filterTouchedErrors', () => {
  it('should keep the errors of touched fields only', () => {
    expect(
      filterTouchedErrors(
        [{ value: required }, { value: required }, { value: required }],
        [undefined, { value: true }],
      ),
    ).toEqual([undefined, { value: required }]);
  });

  it('should return undefined when no field with an error is touched', () => {
    expect(filterTouchedErrors([{ value: required }], undefined)).toBe(
      undefined,
    );
    expect(filterTouchedErrors([{ value: required }], [{ other: true }])).toBe(
      undefined,
    );
  });

  it('should keep every error when the whole array is touched', () => {
    const error = [{ value: required }, { value: required }];

    expect(filterTouchedErrors(error, true)).toBe(error);
  });

  it('should keep a row-level error once a field of the row is touched', () => {
    expect(filterTouchedErrors([custom, custom], [{ start: true }])).toEqual([
      custom,
    ]);
  });

  it('should filter nested field arrays', () => {
    expect(
      filterTouchedErrors(
        [{ nested: [{ name: required }, { name: required }] }],
        [{ nested: [undefined, { name: true }] }],
      ),
    ).toEqual([{ nested: [undefined, { name: required }] }]);
  });

  it('should keep the array-level root error', () => {
    const result = filterTouchedErrors(
      Object.assign([{ value: required }], { root: custom }),
      undefined,
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.root).toEqual(custom);
    expect(result[0]).toBeUndefined();
  });

  it('should treat a field named type as a field', () => {
    expect(
      filterTouchedErrors(
        [{ type: required }, { type: required }],
        [undefined, { type: true }],
      ),
    ).toEqual([undefined, { type: required }]);
  });

  it('should treat a row field named root as a field and not leak it when untouched', () => {
    const errors = [
      { value: required, root: required },
      { value: required, root: required },
    ];
    // Only rows[0].value is touched; neither rows[0].root nor rows[1] has been touched
    const touched = [{ value: true }];

    expect(filterTouchedErrors(errors, touched)).toEqual([{ value: required }]);
  });

  it('should keep both an array-level root error and a touched row field named root', () => {
    const errors = Object.assign(
      [
        { value: required, root: required },
        { value: required, root: required },
      ],
      { root: custom },
    );
    // rows[0].root is touched; rows[0].value and rows[1] are untouched
    const touched = [{ root: true }];

    const result = filterTouchedErrors(errors, touched);
    expect(Array.isArray(result)).toBe(true);
    expect(result.root).toEqual(custom);
    expect(result[0]).toEqual({ root: required });
    expect(result[1]).toBeUndefined();
  });
});

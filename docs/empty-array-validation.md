# Empty Array Validation

## Purpose

This enhancement ensures that array fields with validation rules (like minimum length requirements) are properly validated when their values are cleared using `setValue` with `shouldValidate: true`.

### Benefits

- Users get immediate validation feedback when clearing array fields
- Arrays behave consistently with other field types when using `shouldValidate`
- Validation errors appear as soon as the array is cleared, not just on form submission

## API Changes

### Property updates

No new properties are added or type changes are required. The existing `setValue` function behavior is enhanced to properly handle array validation.

### Description

Previously, when using `setValue` to set an empty array with `shouldValidate: true`, validation would not be triggered. This meant that validation errors for required array fields or arrays with minimum length requirements would not appear until the form was submitted or validation was manually triggered.

### Behavior

The fix ensures that validation is properly triggered for all array fields when `shouldValidate` is set to `true`, including:

- Field arrays
- Empty arrays
- Nested array fields
- Deeply nested array structures

When `setValue` is called with an empty array and `shouldValidate: true`, the validation engine now properly recognizes this as a value change that requires validation.

### Examples

#### Basic Example

```typescript
import { useForm } from '@bombillazo/rhf-plus';

const MyForm = () => {
  const { setValue, formState: { errors } } = useForm({
    defaultValues: {
      items: ['item1', 'item2']
    }
  });

  const clearItems = () => {
    // This will now properly trigger validation
    setValue('items', [], { shouldValidate: true });
  };

  return (
    <form>
      {/* Your form fields */}
      {errors.items && <span>Items cannot be empty</span>}
      <button type="button" onClick={clearItems}>Clear Items</button>
    </form>
  );
};
```

#### Before vs After

```typescript
// Before (workaround was needed)
setValue('items', []);
trigger('items'); // Manual trigger was needed

// After (fixed)
setValue('items', [], { shouldValidate: true }); // Validation triggers automatically
```

## Limitations

None. This fix works with all array types and validation scenarios without introducing any limitations.

## Backward Compatibility

No breaking changes are introduced with this fix. Existing code will continue to work as before, but will now properly trigger validation for empty arrays when `shouldValidate: true` is specified.

If you were previously working around this issue by manually calling `trigger()` after setting empty arrays, you can now remove that workaround.

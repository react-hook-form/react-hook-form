<div align="center">
  <img src="./logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

<a href="https://www.npmjs.com/package/@bombillazo/rhf-plus"><img src="https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge" alt="npm downloads" /></a>
<a href="https://www.npmjs.com/package/@bombillazo/rhf-plus"><img src="https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge" alt="npm total downloads" /></a>
<a href="https://github.com/bombillazo/rhf-plus/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge" alt="license" /></a>

</div>

React Hook Form Plus (**RHF+**) is an enhanced fork of [React Hook Form](https://react-hook-form.com/). It is designed to be a drop-in replacement for React Hook Form, so you can use it in your existing projects without any changes.

## Quick Start

### Installation

```sh
npm install @bombillazo/rhf-plus

yarn add @bombillazo/rhf-plus

pnpm add @bombillazo/rhf-plus
```

Simply replace your React Hook Form import:

```ts
// Before
import { useForm } from 'react-hook-form';

// After
import { useForm } from '@bombillazo/rhf-plus';
```

## ✨ Enhancements

### Major Features

- [**Imperative form submission**](./imperative_submit.md) - Submit forms programmatically with enhanced control
- [**Smart "disabled" state**](./smart-disabled-state.md) - Intelligent field disabling based on form state
- [**Controllable "isLoading" state**](./controllable-is-loading-state.md) - Manual control over form loading state
- [**Form metadata**](./form-metadata.md) - Access additional form information and statistics
- [**"ScrollIntoView" method on field refs**](./scroll-into-view-method.md) - Automatically scroll to fields with errors
- [**"Controller" children function**](./controller-children-function.md) - Enhanced controller component with function children
- [**Form and field "focus" state**](./focused-fields.md) - Track which fields are currently focused
- [**Form "isDirtySinceSubmit" state**](./is-dirty-since-submit.md) - Detect changes after form submission
- [**Form "hasBeenSubmitted" state**](./has-been-submitted.md) - Track if form has ever been submitted
- [**Readonly field validation skip**](./readonly-validation-skip.md) - Skip validation for readonly fields
- [**Per-field validation modes**](./per-field-validation-modes.md) - Override form-level validation timing per field

### Minor Improvements

- [Controller rules update on prop change](./controller-rules-update.md)
- [Empty array validation](./empty-array-validation.md)
- [Add displayName to "useFormContext"](./use-form-context-display-name.md)
- [Improve "useController" error on missing "control" prop](./improve-missing-use-controller-prop-error.md)

### ⚠️ Performance Note

We've optimized enhancements and features to minimize the impact on form performance. That said, adding new form states, methods, and data events results in the unavoidable outcome of:

- Increased package size
- Additional form renders

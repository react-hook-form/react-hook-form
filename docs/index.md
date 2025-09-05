# React Hook Form Plus (RHF+)

<div align="center">
  <img src="./logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge)](https://github.com/bombillazo/rhf-plus/blob/master/LICENSE)

</div>

React Hook Form Plus (**RHF+**) is a fork of [React Hook Form](https://react-hook-form.com/) with feature enhancements. It is designed to be a drop-in replacement for React Hook Form, so you can use it in your existing projects without any changes.

## Quick Start

### Installation

```sh
npm install @bombillazo/rhf-plus
```

```sh
yarn add @bombillazo/rhf-plus
```

```sh
pnpm add @bombillazo/rhf-plus
```

## ✨ Enhancements

### Major Features

- [**Imperative form submission**](./imperative_submit.md) - Submit forms programmatically with enhanced control
- [**Smart `disabled` state**](./smart-disabled-state.md) - Intelligent field disabling based on form state
- [**JSX error messages**](./jsx-error-messages.md) - Render JSX components as error messages
- [**Controllable `isLoading` state**](./controllable-is-loading-state.md) - Manual control over form loading state
- [**Form metadata**](./form-metadata.md) - Access additional form information and statistics
- [**`ScrollIntoView` method on field refs**](./scroll-into-view-method.md) - Automatically scroll to fields with errors
- [**`Controller` children function**](./controller-children-function.md) - Enhanced controller component with function children
- [**Form and field `focus` state**](./focused-fields.md) - Track which fields are currently focused
- [**Form `isDirtySinceSubmit` state**](./is-dirty-since-submit.md) - Detect changes after form submission
- [**Form `hasBeenSubmitted` state**](./has-been-submitted.md) - Track if form has ever been submitted
- [**Readonly field validation skip**](./readonly-validation-skip.md) - Skip validation for readonly fields

### Minor Improvements

- [Controller rules update on prop change](./controller-rules-update.md)
- [Empty array validation](./empty-array-validation.md)
- [Add displayName to `useFormContext`](./use-form-context-display-name.md)
- [Improve `useController` error on missing `control` prop](./improve-missing-use-controller-prop-error.md)

## Why RHF+?

React Hook Form is a robust and delightful form library for React. However, maintaining high-quality standards for such a popular package requires careful consideration that can slow feature development. RHF+ was created to bridge this gap by providing enhanced functionality while maintaining full compatibility with the original library.

> [!Warning]
>
> The unavoidable outcome of adding new form states, methods, and data events includes:
>
> - Increased package size
> - Additional form renders
>
> As we add new enhancements, we work to optimize these features to minimize the impact on form performance.

## Contributing

We welcome contributions! Check out our [Contributing Guide](../CONTRIBUTING.md) to get started.

## Issues & Support

Report bugs and request features in our [GitHub Issues](https://github.com/bombillazo/rhf-plus/issues).

## License

This project is licensed under the same terms as React Hook Form. See the [LICENSE](../LICENSE) file for details.

<div align="center">
  <img src="./docs/logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge)](https://github.com/bombillazo/rhf-plus/blob/master/LICENSE)

</div>

React Hook Form Plus (**RHF+**) is a fork of [React Hook Form](https://react-hook-form.com/) with feature enhancements. It is designed to be a drop-in replacement for React Hook Form, so you can use it in your existing projects without any changes.

## Install

### npm

```sh
npm install @bombillazo/rhf-plus
```

### yarn

```sh
yarn add @bombillazo/rhf-plus
```

### pnpm

```sh
pnpm add @bombillazo/rhf-plus
```

## ✨ Enhancements

- [Imperative form submission](./docs/imperative_submit.md)
- [Smart `disabled` state](./docs/smart-disabled-state.md)
- [JSX error messages](./docs/jsx-error-messages.md)
- [Controllable `isLoading` state](./docs/controllable-is-loading-state.md)
- [Form metadata](./docs/form-metadata.md)
- [`ScrollIntoView` method on field refs](./docs/scroll-into-view-method.md)
- [`Controller` children function](./docs/controller-children-function.md)
- [Form and field `focus` state](./docs/focused-fields.md)
- [Form `isDirtySinceSubmit` state](./docs/is-dirty-since-submit.md)
- [Form `hasBeenSubmitted` state](./docs/has-been-submitted.md)
- [Readonly field validation skip](./docs/readonly-validation-skip.md)

Minor improvements:

- [Controller rules update on prop change](./docs/controller-rules-update.md)
- [Empty array validation](./docs/empty-array-validation.md)
- [Add displayName to `useFormContext`](./docs/use-form-context-display-name.md)
- [Improve `useController` error on missing `control` prop](./docs/improve-missing-use-controller-prop-error.md)

> [!Warning]
>
> The unavoidable outcome of adding new form states, methods, and data events includes:
>
> - Increased package size
> - Additional form renders
>
> As we add new enhancements, we work to optimize these features to minimize the impact on form performance.


## Motive

React Hook Form is a robust and delightful form library for React. Preserving high-quality standards for such a popular package takes time, effort, and thoughtfulness from maintainers. In the case of React Hook Form, this has caused a development bottleneck that slows and stalls contributions.

Thus, [`rhf-plus`](https://github.com/bombillazo/rhf-plus) was born: a fork of React Hook Form that enhances the library with new features and improvements while keeping the core of the library intact.

### 🏁 Goals

- **Features**: This package aims to enhance React Hook Form's functionality. We avoid other development efforts.
- **Compatibility**: New features should be additive and non-breaking. `rhf-plus` aims to stay closely synced to the original React Hook Form.
- **Practicality**: The enhancements must be practical and solve real-world problems.
- **Speed**: Discuss, review, and ship features fast!
- **Quality**: We maintain the same high-quality standards as React Hook Form. This means clean code, thorough testing, and precise documentation.

### ❌ Out of Scope

- **React Hook Form bugs**  
React Hook Form maintainers are responsible for fixing its bugs. We focus on fixing bugs related to our enhancements. When those bugs are fixed, they are rolled into this package when we sync to the latest React Hook Form version.

- **Refactors**  
We do not refactor React Hook Form code. This includes adding new tooling, changing documentation, updating dependency versions, fixing code styling, and anything unrelated to adding new features and enhancements (these changes complicate syncing the fork with the upstream repository).

- **Breaking changes**  
We do not introduce breaking changes to the React Hook Form API. We only add new features and enhancements that are backward compatible with the existing API.

- **Complex/bloated features**  
We avoid enhancements that aggressively modify large parts of the React Hook Form codebase. This ensures we do not diverge too much from the original package.

- **Past React Hook Form versions**  
As new enhancements are introduced, they are only applied to the current and latest React Hook Form versions. This ensures that we are closely synced to React Hook Form and reduces the overhead of maintaining multiple `rhf-plus` versions.

### 📣 Help us grow

Ideally, this fork would not exist, and all of these enhancements and features would be natively part of React Hook Form. Here's how you can help RHF+ grow:

- Spread the word about this package so more people can test these enhancements
- Use this library to test the enhancements and provide feedback.
- Report enhancement bugs and issues [here](https://github.com/bombillazo/rhf-plus/issues).
- [Contribute](CONTRIBUTING.md) new code to add new enhancements.
- Share the enhancements in the React Hook Form [issues](https://github.com/react-hook-form/react-hook-form/issues) where applicable:
  - Upvote the issue to garner support
  - Link to the enhancement page in this repo to show the available working solution

## Versioning

`rhf-plus` versions look something like this:

```sh
7.55.0-plus.0
\____/\____/|
  |     |   |
  1     2   3
```

1. **React Hook Form version**  
The React Hook Form version used as the base to add enhancements to (e.g., `7.55.0`)  

1. **Separator token**  
Separates React Hook Form from RHF+ version (always `-plus.`)  

1. **RHF+ version**  
RHF+ version index (e.g., `0`)

> [!Note]
> Please get in touch with maintainers if a new React Hook Form version is available and this library is behind. We will sync `rhf-plus` and release a new version.

### Conventions

1. New RHF+ versions use the latest React Hook Form version as the base version
2. RHF+ versions start from index `0`
   - For example, the first version of `rhf-plus` based on React Hook Form `7.55.0` would be `7.55.0-plus.0`
3. The RHF+ version increments with each new `rhf-plus` release
   - For example, a new release based on React Hook Form `7.55.0` would bump the version to `7.5.0-plus.1`
4. The RHF+ version is reset to `0` when a new version of React Hook Form is released
   - For example, if React Hook Form `7.56.0` is released, the newly synced version of `rhf-plus` based on that would be `7.56.0-plus.0`

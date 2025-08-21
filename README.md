<div align="center">
  <img src="./docs/logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge)](https://github.com/bombillazo/rhf-plus/blob/master/LICENSE)

</div>

**RHF+** is a fork of [react-hook-form](https://react-hook-form.com/) (**RHF**) with feature enhancements. It is designed to be a drop-in replacement for RHF so you can use it in your existing projects without any changes.

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

Minor improvements:

- [Add displayName to `useFormContext`](./docs/use-form-context-display-name.md)
- [Controller rules no longer stale on prop change](./docs/controller-rules-update.md)
- [Improve `useController` error on missing `control` prop](./docs/improve-missing-use-controller-prop-error.md)

## Motive

RHF is a robust and delightful form library for React. Preserving high-quality standards for such a popular package takes time, effort, and thoughtfulness from maintainers. In the case of RHF, this has caused a development bottleneck that slows and stalls contributions.

Thus, [`rhf-plus`](https://github.com/bombillazo/rhf-plus) was born: a fork of RHF that enhances the library with new features and improvements while keeping the core of RHF intact.

## Goals

- **Features**: This package aims to enhance RHF's functionality. We avoid other development efforts.
- **Compatibility**: New features should be additive, not destructive. `rhf-plus` aims to stay closely synced to the original RHF.
- **Practicality**: The enhancements must be practical and solve real-world problems.
- **Speed**: Discuss, review, and ship features fast!
- **Quality**: We maintain the same high-quality standards as RHF. This means clean code, testing, and clear documentation.

### ❌ Out of Scope

- **RHF bugs**  
RHF maintainers are responsible for fixing RHF bugs. We focus on fixing bugs related to our enhancements. When RHF bugs are fixed, those fixes are rolled into this package when we sync to the latest RHF version.

- **Refactors**  
We do not refactor RHF code. This includes adding new tooling, changing documentation, updating dependency versions, fixing code styling, and anything unrelated to adding new features and enhancements (these changes complicate syncing the fork with RHF).

- **Breaking changes**  
We do not introduce breaking changes to the RHF API. We only add new features and enhancements that are backward compatible with the existing RHF API.

- **Complex/bloated features**  
We avoid enhancements that aggressively modify large parts of the RHF codebase. This ensures we do not diverge too much from the original RHF package.

- **Past RHF versions**  
As new enhancements are introduced, they are only applied to the current and latest RHF versions. This ensures that we are closely synced to RHF and reduces the overhead of maintaining multiple `rhf-plus` versions.

### 📣 Help us grow

Ideally, this fork would not exist, and all of these enhancements and features would be natively part of RHF. You can help RHF and RHF+ grow by:

- Spreading the word about this fork so more people test these enhancements
- Using this library to test the enhancements and provide feedback.
- Reporting enhancement bugs and issues [here](https://github.com/bombillazo/rhf-plus/issues).
- [Contributing](CONTRIBUTING.md) new code to add new enhancements.
- Sharing the enhancements in the react-hook-form [issues](https://github.com/react-hook-form/react-hook-form/issues) (create a new one if it doesn't exist).:
  - Upvote the issue to garner support
  - Kindly comment on the issue to show RHF maintainers there is a demand
  - Link to the enhancement page in this repo to show the working solution is available

## Versioning

> [!Note]
> Please contact the maintainers if a new RHF version is available and this library is behind. We will sync `rhf-plus` and release a new version.

`rhf-plus` versions look something like this:

```sh
7.55.0-plus.0
\____/\____/|
  |     |   |
  1     2   3
```

1. **RHF version**  
The react-hook-form version used as the base to add enhancements to (e.g., `7.55.0`)  

1. **Separator token**  
Separates RHF from RHF+ version (always `-plus.`)  

1. **RHF+ version**  
RHF+ version index (e.g., `0`)

### Conventions

1. New RHF+ versions use the latest RHF version as the base version
2. RHF+ versions start from index `0`
   - For example, the first version of `rhf-plus` based on RHF `7.55.0` would be `7.55.0-plus.0`
3. The RHF+ version increments with each new `rhf-plus` release
   - For example, a new release based on RHF `7.55.0` would bump the version to `7.5.0-plus.1`
4. The RHF+ version is reset to `0` when a new version of RHF is released
   - For example, if RHF `7.56.0` is released, the newly synced version of `rhf-plus` based on that would be `7.56.0-plus.0`

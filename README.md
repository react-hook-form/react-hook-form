<div align="center">
  <img src="./docs/logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge)](https://github.com/bombillazo/rhf-plus/blob/master/LICENSE)

</div>

**RHF+** is a fork of [react-hook-form](https://react-hook-form.com/) (**RHF**) with some feature enhancements. It is designed to be a drop-in replacement for RHF so you can use it in your existing projects without any changes.

### Install

```sh
npm install @bombillazo/rhf-plus
```

### Motive

RHF is a delightfully designed and robust React form library. But preserving such high-quality standards takes time, effort, and thoughtfulness from maintainers. In the case of RHF, this has caused a bottleneck that has slowed and stalled contributions.

This led to the creation of `rhf-plus`: a fork of RHF that enhances the library with new features and improvements while keeping the core of RHF intact.

Our central tenets are:

- **Feature-focused**: This package aims to enhance RHF's functionality. We avoid other development efforts.
- **Compatibility**: New features should be additive, not destructive. `rhf-plus` aims to stay closely synced to the original RHF.
- **Practicality**: The enhancements added must be practical and solve real-world problems.
- **Speed**: We want to discuss, review, and ship features faster!
- **Quality**: We maintain the same high-quality standards as RHF. This means clean code, testing, and clear documentation.

Ideally, this fork would not exist, and all of these enhancements and features would be built into RHF. In the meantime, we are happy to share our work with the community and hope that it will be helpful to you.

#### Out of Scope

We want to be clear on what do **NOT** do in this package:

- **Support past RHF versions**: As new enhancements are introduced, they will only be applied to the current and latest RHF versions. This ensures that we are closely synced to RHF and reduces the overhead of maintaining multiple versions of `rhf-plus`.
- **Refactoring and styling**: We will not be refactoring RHF code, adding new tooling or updating code styling. We will only be adding new features and enhancements. This ensures that we are not diverging too much from the original RHF package and are not creating a separate library.
**Fix RHF bugs**: The RHF maintainers are responsible for fixing RHF bugs. We will focus on fixing `rhf-plus` bugs related to our enhancements. When RHF bugs are fixed, we will roll the fixes into `rhf-plus` when we sync versions.
- **Add complex or bloated enhancements**: We avoid enhancements that upend large parts of the codebase. This ensures we do not diverge too much from the original RHF package.

### Enhancements

- [Imperative Form Submission](./docs/imperative_submit.md)
- Form Level Metadata (WIP)
- More to come... ([Become a contributor](CONTRIBUTING.md))

### Versioning

To make versioning simple, `rhf-plus` follows these versioning rules:

- `rhf-plus` versions are based on the `latest` existing RHF version to which the enhancements are applied (e.g., `7.5.0`).
- `rhf-plus` versions are suffixed with `-plus.x`, staring with index `0`.
  - For example, the first version of `rhf-plus` based on RHF `7.5.0` will be `7.5.0-plus.0`.
- The `-plus.x` suffix is incremented with each new release of `rhf-plus`.
  - For example, an update to `rhf-plus` based on RHF `7.5.0` would bump the version to `7.5.0-plus.1`.
- The `-plus.x` suffix is reset to `0` when a new version of RHF is released.

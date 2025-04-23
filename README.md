<div align="center">
  <img src="./docs/logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge)](https://github.com/bombillazo/rhf-plus/blob/master/LICENSE)

</div>

**RHF+** is a fork of [react-hook-form](https://react-hook-form.com/) (**RHF**) with some feature enhancements. It is designed to be a drop-in replacement for RHF, so you can use it in your existing projects without any changes.

### Install

```sh
npm install @bombillazo/rhf-plus
```

### Enhancements

- [Imperative Form Submission](./docs/imperative_submit.md)
- Form Level Metadata (WIP)
- More to come... ([Become a contributor](CONTRIBUTING.md))

### Versioning

Even though we are enhancing RHF, `rhf-plus` aims to follow the original RHF package as closely as possible. Our focus will be on:

- adding new enhancements
- keeping this library synced with the `latest` RHF version

To make versioning simple, `rhf-plus` follows these versioning rules:

- `rhf-plus` versions are based on the `latest` existing RHF version to which the enhancements are applied (e.g., `7.5.0`).
- `rhf-plus` versions are suffixed with `-plus.x`, staring with index `0`.
  - For example, the first version of `rhf-plus` based on RHF `7.5.0` will be `7.5.0-plus.0`.
- The `-plus.x` suffix is incremented with each new release of `rhf-plus`.
  - For example, an update to `rhf-plus` based on RHF `7.5.0` would bump the version to `7.5.0-plus.1`.
- The `-plus.x` suffix is reset to `0` when a new version of RHF is released.

#### Out of Scope

Things we will **NOT** do with this package:

- **Support older RHF versions**:  As new enhancements come in, they will only be applied to the current and latest RHF version. This is to ensure that we are closely synced to RHF and to reduce the overhead of maintaining multiple versions of `rhf-plus`.
- **Fix RHF bugs**: Those are the responsibility of the RHF team. We will only focus on fixing bugs in `rhf-plus` that are related to our enhancements. Once RHF fixes a bug, we will roll them into `rhf-plus` when we sync versions.
- **Add unrelated RHF features**: This is to ensure that we are not diverging too much from the original RHF package and are not creating a separate library.

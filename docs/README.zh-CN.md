<div align="center">
    <p align="center">
      <a href="https://react-hook-form.com/zh" title="React Hook Form - Simple React forms validation">
        <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - hook custom hook for form validation" width="330px" />
      </a>
    </p>
</div>

<div align="center">

高性能、灵活、易拓展、易于使用的表单校验库

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)
[![Coverage Status](https://img.shields.io/coveralls/github/bluebill1049/react-hook-form/master?style=for-the-badge)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center"><p align="center"><a href="https://react-hook-form.com/zh" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form Logo - React hook form validation" width="100%" /></a></p></div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | 🇨🇳 简体中文 | <a href="./README.ja-JP.md">🇯🇵 日本語</a> | <a href="./README.ko-KR.md">🇰🇷한국어</a> | <a href="./README.fr-FR.md">🇫🇷Français</a> | <a href="./README.it-IT.md">🇮🇹Italiano</a> | <a href="./README.pt-BR.md">🇧🇷Português</a> | <a href="./README.es-ES.md">🇪🇸Español</a> | <a href="./docs/README.ru-RU.md">🇷🇺Русский</a>

## 特性

- 使创建表单和集成更加便捷
- 非受控表单校验
- 以性能和开发体验为基础构建
- [迷你](https://bundlephobia.com/result?p=react-hook-form@latest)的体积而没有其他依赖
- 遵循 html 标准进行校验
- 与React Native兼容
- 支持[Yup](https://github.com/jquense/yup), [Joi](https://github.com/hapijs/joi), [Superstruct](https://github.com/ianstormtaylor/superstruct)或自定义
- 支持浏览器原生校验
- 从[这里](https://react-hook-form.com/zh/form-builder)快速构建你的表单

## 安装

    $ npm install react-hook-form

## 链接

- [动机](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [开始](https://react-hook-form.com/zh/get-started)
- [API](https://react-hook-form.com/zh/api)
- [示例](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com/zh)
- [Form Builder](https://react-hook-form.com/zh/form-builder)
- [常见问题](https://react-hook-form.com/zh/faqs)

## 快速开始

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} /> {/* register an input */}
      <input name="lastname" ref={register({ required: true })} />
      {errors.lastname && 'Last name is required.'}
      <input name="age" ref={register({ pattern: /\d+/ })} />
      {errors.age && 'Please enter number for age.'}
      <input type="submit" />
    </form>
  );
}
```

## 支持者

感谢所有支持者! [[成为支持者](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## 组织机构

感谢这些精彩的组织！ [[捐助](https://opencollective.com/react-hook-form/contribute)]

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## 贡献者

感谢这些出色的人！ [[成为贡献者](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>

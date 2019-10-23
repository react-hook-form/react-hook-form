<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com/zh" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook form validation" width="330px" /></a>
    </p>
</div>

<div align="center">

高性能、灵活、易拓展、易于使用的表单校验库

[![CircleCI](https://badgen.net/github/status/react-hook-form/react-hook-form/master/ci/circleci)](https://circleci.com/gh/react-hook-form/react-hook-form)
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
![dep](https://badgen.net/david/dep/bluebill1049/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center"><p align="center"><a href="https://react-hook-form.com/zh" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form Logo - React hook form validation" width="750px" /></a></p></div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | 🇨🇳简体中文 | <a href="./README.ja-JP.md">🇯🇵日本语</a> | <a href="./README.fr-FR.md">🇫🇷Français</a> | <a href="./README.ko-KR.md">🇰🇷한국어</a>

## 特性

- 使创建表单和集成更加便捷
- 以性能和开发体验为基础构建
- 非受控表单校验
- [迷你](https://bundlephobia.com/result?p=react-hook-form@latest)的体积而没有其他依赖
- 遵循html标准进行校验
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
- [常见问题](https://react-hook-form.com/zh/faq)

## 快速开始

```jsx
import React from 'react';
import useForm from 'react-hook-form';

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

## 贡献者

感谢这些为该开源项目作出贡献的人:

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>

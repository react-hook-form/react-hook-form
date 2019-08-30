<div align="right">🇦🇺English | <a href="https://github.com/bluebill1049/react-hook-form/blob/master/README.zh-CN.md">🇨🇳简体中文</a></div>

<div align="center"><p align="center"><a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook form validation" width="330px" /></a></p></div>

<div align="center">

Build React Form close to Native

[![CircleCI](https://circleci.com/gh/react-hook-form/react-hook-form.svg?style=svg)](https://circleci.com/gh/react-hook-form/react-hook-form)
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center"><p align="center"><a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation"><img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form Logo - React hook form validation" width="750px" /></a></p></div>

- Super easy to integrate and create forms
- Built with performance and DX in mind
- Uncontrolled form validation
- [Tiny size](https://bundlephobia.com/result?p=react-hook-form@latest) without any dependency
- Follows HTML standard for validation
- Support browser native validation
- Build forms quickly with the [form builder](https://react-hook-form.com/builder)

## Install

    $ npm install react-hook-form

## [Docs](https://react-hook-form.com/api)

- [Motivation](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Get started](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Examples](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/builder)
- [FAQs](https://react-hook-form.com/faq)

## Quickstart

```jsx
import React from 'react';
import useForm from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = data => {
    console.log(data);
  }; // callback when validation pass

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

## Contributors

Thanks goes to these wonderful people:

<img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />

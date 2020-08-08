<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">Performant, flexible and extensible forms with easy to use validation.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)](https://bundlephobia.com/result?p=react-hook-form)
[![Coverage Status](https://img.shields.io/coveralls/github/bluebill1049/react-hook-form/master?style=for-the-badge)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React custom hook for form validation" width="100%" />
        </a>
    </p>
</div>

English | <a href="./docs/README.zh-TW.md">繁中</a> | <a href="./docs/README.zh-CN.md">简中</a> | <a href="./docs/README.ja-JP.md">日本語</a> | <a href="./docs/README.ko-KR.md">한국어</a> | <a href="./docs/README.fr-FR.md">Français</a> | <a href="./docs/README.it-IT.md">Italiano</a> | <a href="./docs/README.pt-BR.md">Português</a> | <a href="./docs/README.es-ES.md">Español</a> | <a href="./docs/README.ru-RU.md">Русский</a> | <a href="./docs/README.de-DE.md">Deutsch</a> | <a href="./docs/README.tr-TR.md">Türkçe</a>

## Features

- Built with performance and DX in mind
- Embrace native form validation
- Simple integration with [UI libraries](https://codesandbox.io/s/react-hook-form-v6-controller-24gcl)
- [Tiny size](https://bundlephobia.com/result?p=react-hook-form@latest) without any dependency
- Follows HTML standard for [validation](https://react-hook-form.com/get-started#Applyvalidation)
- [Resolvers](https://github.com/react-hook-form/resolvers) support [Yup](https://github.com/jquense/yup), [Superstruct](https://github.com/ianstormtaylor/superstruct), [Joi](https://github.com/hapijs/joi) or custom
- Build forms quickly with [Form Builder](https://react-hook-form.com/form-builder)

## Install

    npm install react-hook-form

## Links

- [Motivation](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Video tutorial](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [Get started](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [Examples](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Demo](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/form-builder)
- [FAQs](https://react-hook-form.com/faqs)

## Quickstart

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // initialise the hook
  const onSubmit = (data) => {
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

## Sponsors

<a href="https://underbelly.is/" target="_blank">
<img src="https://images.opencollective.com/underbelly/989a4a6/logo/256.png" width="75" height="75" />
</a>

<br />

Want your logo here? [DM on Twitter](https://twitter.com/HookForm)

## Backers

Thanks goes to all our backers! [[Become a backer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## Organizations

Thanks goes to these wonderful organizations! [[Contribute](https://opencollective.com/react-hook-form/contribute)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=890" />
</a>

## Contributors

Thanks goes to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=890" />
</a>

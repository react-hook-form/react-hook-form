<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">高性能で柔軟かつ拡張可能な使いやすいフォームバリデーションライブラリ。</p>

<div align="center">

[![CircleCI](https://badgen.net/circleci/github/react-hook-form/react-hook-form)](https://circleci.com/gh/react-hook-form/react-hook-form)
[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=flat-square)](https://www.npmjs.com/package/react-hook-form)
![dep](https://badgen.net/david/dep/bluebill1049/react-hook-form)
[![npm](https://badgen.net/bundlephobia/minzip/react-hook-form)](https://badgen.net/bundlephobia/minzip/react-hook-form)
[![Coverage Status](https://coveralls.io/repos/github/bluebill1049/react-hook-form/badge.svg?branch=master)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React custom hook for form validation" width="750px" />
        </a>
    </p>
</div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | <a href="./README.zh-CN.md">🇨🇳简体中文</a> | 🇯🇵日本语 | <a href="./README.fr-FR.md">🇫🇷Français</a> | <a href="./README.ko-KR.md">🇰🇷한국어</a>

## 特徴

- パフォーマンスと DX を念頭に構築
- 非制御フォームバリデーション
- 依存関係のない[小さなサイズ](https://bundlephobia.com/result?p=react-hook-form@latest)
- React Native との互換性
- [Yup](https://github.com/jquense/yup) スキーマベースのバリデーションをサポート
- ブラウザのネイティブバリデーションをサポート
- [Form Builder](https://react-hook-form.com/form-builder) でフォームを素早く作成

## インストール

    $ npm install react-hook-form

## リンク集

- [動機](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [ビデオチュートリアル](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [始める](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [例](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [デモ](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/form-builder)
- [FAQ](https://react-hook-form.com/faq)

## クイックスタート

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

## コントリビューター

これらの素晴らしい人々に感謝します。[[コントリビューターになる](CONTRIBUTING.md)]

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>

## 支援者

全ての支援者に感謝します! [[支援者になる](https://opencollective.com/react-hook-form#backer)]

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

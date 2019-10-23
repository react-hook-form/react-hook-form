<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">유연하고 확장 가능한 사용하기 쉬운 고성능 폼 검증 라이브러리</p> 

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

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | <a href="./README.zh-CN.md">🇨🇳简体中文</a> | <a href="./README.ja-JP.md">🇯🇵日本语</a> | 🇫🇷 <a href="./README.fr-FR.md">Français</a> | 🇰🇷한국어

## 특징

- 성능과 DX를 기반으로 구축
- 제어되지 않는 양식 검증
- 의존성 없는 [작은 용량](https://bundlephobia.com/result?p=react-hook-form@latest) 
- HTML 표준을 따르는 검증  
- Reative Native 와 호환
- [Yup](https://github.com/jquense/yup) 스키마 기반의 검증 지원
- 브라우저 네이티브 검증 지원
- [Form Builder](https://react-hook-form.com/form-builder)로 폼 빠르게 생성 

## 설치

    $ npm install react-hook-form

## 링크

- [만들게된 동기](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [비디오 튜토리얼](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [시작하기](https://react-hook-form.com/get-started)
- [API](https://react-hook-form.com/api)
- [예제](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [데모](https://react-hook-form.com)
- [Form Builder](https://react-hook-form.com/form-builder)
- [FAQs](https://react-hook-form.com/faq)

## 시작하기 

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

## 기여자

모든 기여자 분들께 감사합니다. [[기여 하기](CONTRIBUTING.md)] 

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>

## 후원자 

모둔 후원자 분들께 감사합니다 [[후원 하기](https://opencollective.com/react-hook-form#backer)]

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

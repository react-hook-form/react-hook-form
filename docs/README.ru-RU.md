<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/logo.png" alt="React Hook Form Logo - React hook custom hook for form validation" width="300px" />
        </a>
    </p>
</div>

<p align="center">Быстрые, гибкие и расширяемые формы с простой в использовании проверкой.</p>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/npm/dt/react-hook-form.svg?style=for-the-badge)](https://www.npmjs.com/package/react-hook-form)
[![npm](https://img.shields.io/bundlephobia/minzip/react-hook-form?style=for-the-badge)](https://bundlephobia.com/result?p=react-hook-form)
[![Coverage Status](https://img.shields.io/coveralls/github/bluebill1049/react-hook-form/master?style=for-the-badge)](https://coveralls.io/github/bluebill1049/react-hook-form?branch=master)

[![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=React+hooks+for+form+validation+without+the+hassle&url=https://github.com/bluebill1049/react-hook-form)&nbsp;[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-hook-form)

</div>

<div align="center">
    <p align="center">
        <a href="https://react-hook-form.com" title="React Hook Form - Simple React forms validation">
            <img src="https://raw.githubusercontent.com/bluebill1049/react-hook-form/master/website/example.gif" alt="React Hook Form video - React custom hook for form validation" width="100%" />
        </a>
    </p>
</div>

<a href="https://github.com/react-hook-form/react-hook-form">🇦🇺English</a> | <a href="./docs/README.zh-CN.md">🇨🇳 简体中文</a> | <a href="./docs/README.ja-JP.md">🇯🇵 日本語</a> | <a href="./docs/README.ko-KR.md">🇰🇷한국어</a> | <a href="./docs/README.fr-FR.md">🇫🇷Français</a> | <a href="./docs/README.it-IT.md">🇮🇹Italiano</a> | <a href="./docs/README.pt-BR.md">🇧🇷Português</a> | <a href="./docs/README.es-ES.md">🇪🇸Español</a> | 🇷🇺Русский

## Характеристики

- Создан с учетом производительности и DX
- Применение неконтролируемой проверки форм
- Улучшить производительность контролируемой формы
- [Крошечный размер](https://bundlephobia.com/result?p=react-hook-form@latest) без какой-либо зависимости
- Соответствует стандартам HTML для валидации
- Совместим с React Native
- Поддерживает [Yup](https://github.com/jquense/yup), [Joi](https://github.com/hapijs/joi), [Superstruct](https://github.com/ianstormtaylor/superstruct) или обычай
- Поддержка нативной браузерной валидации
- Быстро создавать формы с [конструктором форм](https://react-hook-form.com/form-builder)

## Установка

    $ npm install react-hook-form

## Ссылки

- [Мотивация](https://medium.com/@bruce1049/form-validation-with-hook-in-3kb-c5414edf7d64)
- [Видеоурок](https://www.youtube.com/watch?v=-mFXqOaqgZk&t)
- [Начать](https://react-hook-form.com/get-started)
- [АПИ](https://react-hook-form.com/api)
- [Примеры](https://github.com/bluebill1049/react-hook-form/tree/master/examples)
- [Демонстрация](https://react-hook-form.com)
- [Конструктор форм](https://react-hook-form.com/form-builder)
- [ЧЗВ](https://react-hook-form.com/faqs)

## Быстрый старт

```jsx
import React from 'react';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit, errors } = useForm(); // инициализация хуков
  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="firstname" ref={register} /> {/* зарегистрировать вход */}

      <input name="lastname" ref={register({ required: true })} />
      {errors.lastname && 'Фамилия обязательна.'}

      <input name="age" ref={register({ pattern: /\d+/ })} />
      {errors.age && 'Пожалуйста, введите ваш возраст.'}

      <input type="submit" />
    </form>
  );
}
```

## Покровители

Спасибо всем нашим покровителям! [[Стать покровителем](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## организации

Спасибо этим замечательным организациям! [[Способствовать](https://opencollective.com/react-hook-form/contribute)]

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## Участники

Спасибо этим замечательным людям! [[Стать участником](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
